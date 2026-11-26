// Plateforme Ovyo : les espaces clients (un média, une entreprise, une agence, une institution…).
// Côté serveur uniquement : ces fonctions lisent la base sans filtre d'espace.
import { dbBrut } from "./store";
import { avecEspace } from "./espace";

export type Espace = {
  id: string; nom: string; slug: string; logo: string | null; couleur: string | null;
  formule: string; statut: "essai" | "actif" | "suspendu" | "resilie";
  essai_fin: string | null; abonnement_fin: string | null; created_at: string;
};
export const ESSAI_JOURS = 14;

// Un espace « tourne » (crons, publications) s'il est en essai non expiré ou abonné et à jour.
export function espaceOuvert(e: Pick<Espace, "statut" | "essai_fin" | "abonnement_fin">): boolean {
  const maintenant = Date.now();
  if (e.statut === "essai") return !e.essai_fin || new Date(e.essai_fin).getTime() > maintenant;
  if (e.statut === "actif") return !e.abonnement_fin || new Date(e.abonnement_fin).getTime() > maintenant;
  return false;
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
      const r = await avecEspace(e.id, () => tache(req.clone()));
      resultats[e.slug] = await r.json().catch(() => ({ status: r.status }));
    } catch (err) {
      console.error(`ovyo: espace ${e.slug}`, err);
      resultats[e.slug] = { ok: false, error: (err as Error).message };
    }
  }
  console.log(`ovyo: ${new URL(req.url).pathname} → ${espaces.length} espace(s)`);
  return Response.json({ ok: true, espaces: espaces.length, resultats });
}
