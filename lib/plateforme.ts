// Plateforme Ovyo : les espaces clients (un média, une entreprise, une agence, une institution…).
// Côté serveur uniquement : ces fonctions lisent la base sans filtre d'espace.
import { dbBrut } from "./store";
import { avecEspace, espaceCourant } from "./espace";
import { chargerConnexions } from "./connexions-espace";

export type Espace = {
  id: string; nom: string; slug: string; logo: string | null; couleur: string | null;
  formule: string; statut: "essai" | "actif" | "suspendu" | "resilie";
  essai_fin: string | null; abonnement_fin: string | null; created_at: string;
  type?: string; profil?: Record<string, string> | null; proprietaire?: string | null;
};
export const ESSAI_JOURS = 7;
export const ESSAI_MAX_POSTS = 15; // publications automatiques possibles pendant l'essai (quota d'IA partagé)

// Un espace « tourne » (crons, publications) s'il est en essai non expiré ou abonné et à jour.
export function espaceOuvert(e: Pick<Espace, "statut" | "essai_fin" | "abonnement_fin">): boolean {
  const maintenant = Date.now();
  if (e.statut === "essai") return !e.essai_fin || new Date(e.essai_fin).getTime() > maintenant;
  if (e.statut === "actif") return !e.abonnement_fin || new Date(e.abonnement_fin).getTime() > maintenant;
  return false;
}

// Pendant l'essai, l'autopilote s'arrête après ESSAI_MAX_POSTS publications (planifiées ou publiées).
// Renvoie la raison de l'arrêt, ou "" si l'espace peut continuer.
export async function limiteEssai(): Promise<string> {
  const E = espaceCourant();
  if (!E) return "";
  const e = await lireEspace(E);
  if (!e || e.statut !== "essai") return "";
  const { count } = await dbBrut().from("ov_posts").select("id", { count: "exact", head: true }).eq("espace_id", E).in("status", ["planifie", "publie"]);
  return (count ?? 0) >= ESSAI_MAX_POSTS ? `limite de l'essai atteinte (${ESSAI_MAX_POSTS} publications) : abonnez-vous pour continuer` : "";
}

export async function lireEspace(id: string): Promise<Espace | null> {
  const { data } = await dbBrut().from("ov_espaces").select("*").eq("id", id).maybeSingle();
  return (data as Espace) ?? null;
}

export async function espacesOuverts(): Promise<Espace[]> {
  const { data, error } = await dbBrut().from("ov_espaces").select("*").in("statut", ["essai", "actif"]).order("created_at");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Espace[]).filter(espaceOuvert);
}

export function slugDe(nom: string): string {
  const base = nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return base || "espace";
}

// Tâches planifiées : appelées une fois pour toute la plateforme, elles tournent pour chaque espace ouvert,
// l'un après l'autre (ou pour un seul avec ?espace=<id>). Une erreur dans un espace n'arrête pas les autres.
export async function parEspace(req: Request, tache: (req: Request) => Promise<Response>): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const cle = new URL(req.url).searchParams.get("key");
  if (!secret || (req.headers.get("authorization") !== `Bearer ${secret}` && cle !== secret)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  const seul = new URL(req.url).searchParams.get("espace");
  const espaces = seul ? [await lireEspace(seul)].filter((e): e is Espace => Boolean(e)) : await espacesOuverts();
  const resultats: Record<string, unknown> = {};
  for (const e of espaces) {
    try {
      const r = await avecEspace(e.id, async () => { await chargerConnexions(e.id); return tache(req.clone()); });
      resultats[e.slug] = await r.json().catch(() => ({ status: r.status }));
    } catch (err) {
      console.error(`ovyo: espace ${e.slug}`, err);
      resultats[e.slug] = { ok: false, error: (err as Error).message };
    }
  }
  console.log(`ovyo: ${new URL(req.url).pathname} → ${espaces.length} espace(s)`);
  return Response.json({ ok: true, espaces: espaces.length, resultats });
}
