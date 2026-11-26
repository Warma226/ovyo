// Rubriques automatiques des clients Ovyo (appelé toutes les 20 min par /api/cron-rubriques, pour chaque espace).
// Pour chaque rubrique cochée et marquée « automatique », Ovyo prépare le prochain créneau (jusqu'à 54 h à l'avance) :
// l'IA remplit le gabarit à partir de la veille du client, sans rien inventer.
// - Comptes réseaux connectés → le post est programmé.
// - Sinon → il attend « à valider » dans le calendrier, à l'heure prévue.
import { aiJson } from "./claude";
import { allSources, allTriggers, isOn, type Platform } from "./config";
import { connectionStatus } from "./publish";
import { db, emptyPost, getSettings, savePost, type Post } from "./store";
import { fetchVeille } from "./veille";
import { GABARITS, nomRubrique, type Champs } from "./gabarits";
import { marque } from "./marque";

type Plan = { jours: number[] | "tous"; heure: number; actu: boolean };
// Heures UTC (= heure de Ouagadougou, Dakar, Abidjan). Jours : 0 = dimanche … 6 = samedi.
const PLAN: Record<string, Plan> = {
  essentiel: { jours: [1, 2, 3, 4, 5, 6], heure: 7, actu: true },
  citation: { jours: "tous", heure: 10, actu: true },
  chiffre: { jours: [1, 2, 3, 4, 5], heure: 12, actu: true },
  question: { jours: [1, 2, 3, 4, 5], heure: 17, actu: true },
  recap: { jours: [5], heure: 18, actu: true },
  conseil: { jours: [1, 4], heure: 9, actu: false },
  saviez: { jours: [2, 5], heure: 10, actu: false },
  vraifaux: { jours: [3], heure: 12, actu: false },
  journee: { jours: "tous", heure: 8, actu: false },
  quiz: { jours: [5], heure: 18, actu: false },
  complete: { jours: [3], heure: 18, actu: false },
};

// Journées internationales (jour-mois) : l'IA ne publie que celles qui concernent le client.
const JOURNEES: Record<string, string> = {
  "02-04": "Journée mondiale contre le cancer", "03-08": "Journée internationale des droits des femmes", "03-15": "Journée mondiale des droits des consommateurs",
  "03-22": "Journée mondiale de l'eau", "03-24": "Journée mondiale de lutte contre la tuberculose", "04-07": "Journée mondiale de la santé",
  "04-25": "Journée mondiale de lutte contre le paludisme", "05-01": "Fête du travail", "05-03": "Journée mondiale de la liberté de la presse",
  "05-17": "Journée mondiale des télécommunications et de la société de l'information", "06-05": "Journée mondiale de l'environnement",
  "06-12": "Journée mondiale contre le travail des enfants", "08-12": "Journée internationale de la jeunesse", "09-08": "Journée internationale de l'alphabétisation",
  "09-21": "Journée internationale de la paix", "10-05": "Journée mondiale des enseignants", "10-10": "Journée mondiale de la santé mentale",
  "10-16": "Journée mondiale de l'alimentation", "10-31": "Journée mondiale de l'épargne", "11-14": "Journée mondiale du diabète",
  "11-18": "Début de la Semaine mondiale pour un bon usage des antimicrobiens", "11-20": "Journée mondiale de l'enfance",
  "12-01": "Journée mondiale de lutte contre le sida", "12-10": "Journée des droits de l'homme",
};

const MAX_PAR_PASSAGE = 2; // l'IA gratuite a des limites par minute

function prochainCreneau(plan: Plan, pris: Set<string>): Date | null {
  const now = Date.now();
  for (let j = 0; j <= 2; j++) {
    const d = new Date(now);
    const c = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + j, plan.heure, 0));
    if (plan.jours !== "tous" && !plan.jours.includes(c.getUTCDay())) continue;
    if (c.getTime() < now + 30 * 60000 || c.getTime() > now + 54 * 3.6e6) continue;
    if (pris.has(c.toISOString().slice(0, 10))) continue;
    return c;
  }
  return null;
}

async function postsRubrique(rubrique: string) {
  const { data, error } = await db().from("posts").select("id,title,status,scheduled_at")
    .eq("rubrique", rubrique).neq("status", "annule")
    .gte("created_at", new Date(Date.now() - 60 * 864e5).toISOString())
    .order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as Pick<Post, "id" | "title" | "status" | "scheduled_at">[];
}

let veilleCache: { at: number; texte: string } | null = null;
async function contexteVeille(): Promise<string> {
  const s = await getSettings();
  const sources = allSources(s.customSources).filter((x) => isOn(s.sourcesEnabled, x.id, x.enabledByDefault));
  const triggers = allTriggers(s.triggers).filter((t) => isOn(s.triggersEnabled, t.id, t.enabledByDefault));
  const { items } = await fetchVeille(sources, triggers);
  return items
    .filter((it) => !it.blocked && (!it.publishedAt || Date.now() - new Date(it.publishedAt).getTime() < 72 * 3.6e6))
    .sort((a, b) => b.score - a.score).slice(0, 14)
    .map((it, i) => `${i + 1}. ${it.title} (${it.sourceName}) — ${(it.summary ?? "").slice(0, 280)}`).join("\n");
}

export async function autoOvyo(log: string[]) {
  const m = await marque();
  const actives = m.rubriques.filter((id) => PLAN[id] && GABARITS[id]);
  if (!actives.length) return void log.push("Ovyo : aucune rubrique automatique cochée.");
  const conn = connectionStatus();
  const platforms = (["facebook", "linkedin"] as Platform[]).filter((p) => conn[p].configured);
  let faits = 0;
  veilleCache = null;

  for (const id of actives) {
    if (faits >= MAX_PAR_PASSAGE) break;
    const plan = PLAN[id], g = GABARITS[id];
    try {
      const deja = await postsRubrique(id);
      const pris = new Set(deja.filter((p) => p.scheduled_at).map((p) => (p.scheduled_at as string).slice(0, 10)));
      const quand = prochainCreneau(plan, pris);
      if (!quand) continue;

      let sujet = "";
      if (id === "journee") {
        const cle = quand.toISOString().slice(5, 10);
        if (!JOURNEES[cle]) continue;
        sujet = `Journée du ${quand.toISOString().slice(0, 10)} : ${JOURNEES[cle]}. Si elle n'a aucun rapport avec l'activité du client, réponds {"pertinent": false}.`;
      }
      if (plan.actu) {
        if (!veilleCache) veilleCache = { at: Date.now(), texte: await contexteVeille() };
        if (!veilleCache.texte) { log.push(`${nomRubrique(id)} : veille vide, rien à résumer.`); continue; }
        sujet = `Articles récents de la veille du client (à utiliser comme seule source de faits) :\n${veilleCache.texte}`;
      }
      const schema = g.champs.filter((c) => c.id !== "photo").map((c) => `"${c.id}": ${c.n ? `liste de ${c.n} textes (${c.max ?? 60} caractères max)` : `texte (${c.max ?? 120} caractères max)`} : ${c.label}`).join("\n");
      const r = await aiJson<{ pertinent?: boolean; champs?: Champs; texte?: string }>(
        `Tu prépares les publications de {{IDENTITE}}\nRubrique : ${g.tag}. ${g.consigne}\nRègles : français professionnel, phrases courtes. Aucune invention de chiffre, de citation, de nom ou de fait : utilise uniquement les faits fournis ou des connaissances générales sûres. Si tu n'as pas de matière fiable, réponds {"pertinent": false}.`,
        `Date de publication : ${quand.toISOString().slice(0, 10)}.\n${sujet}\nÀ ne pas répéter (déjà publiés) : ${deja.slice(0, 12).map((p) => p.title).join(" | ") || "rien"}\n\nRéponds en JSON : {"pertinent": true, "champs": {\n${schema}\n}, "texte": "le texte du post (2 à 5 phrases) avec 2 ou 3 hashtags dont #{{TAG}}"}`,
        1500,
      );
      if (r.pertinent === false || !r.champs) { log.push(`${nomRubrique(id)} : rien de fiable pour ce créneau.`); continue; }
      const c = r.champs, texte = r.texte ?? "";
      await savePost(emptyPost({
        rubrique: id, origin: "veille", idea: `Préparé automatiquement (${nomRubrique(id)})`,
        title: c.titre || c.chiffre || c.texte?.slice(0, 80) || c.items?.[0] || nomRubrique(id),
        texts: { facebook: texte, linkedin: texte, tiktok: "", wp_title: c.titre ?? "", wp_body: texte, commun: texte },
        visual: { titre: c.titre ?? "", texte: c.texte ?? "", champs: c },
        platforms: platforms.length ? platforms : ["facebook", "linkedin"],
        status: platforms.length ? "planifie" : "a_valider", auto: true, scheduled_at: quand.toISOString(),
      }));
      faits++;
      log.push(`${nomRubrique(id)} : prêt pour le ${quand.toISOString().slice(0, 16).replace("T", " à ")} UTC${platforms.length ? "" : " (à valider : aucun compte connecté)"}.`);
    } catch (e) {
      log.push(`${nomRubrique(id)} : ${(e as Error).message}`);
      if (/quota|429|indisponible/i.test((e as Error).message)) break;
    }
  }
}
