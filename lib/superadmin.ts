// Administration de la plateforme Ovyo (propriétaire du service) : distincte des administrateurs d'un espace client.
// Un compte est super-administrateur si son contact figure dans la table ov_superadmins (ajouté à la main, en base).
import { dbBrut } from "./store";
import { moi } from "./equipe";

export async function superAdmin(): Promise<{ uid: string; contact: string } | null> {
  const m = await moi();
  if (!m.uid) return null;
  const { data: membre } = await dbBrut().from("ov_membres").select("contact,statut").eq("id", m.uid).maybeSingle();
  const contact = String(membre?.contact ?? "").trim().toLowerCase();
  if (!contact || membre?.statut !== "actif") return null;
  const { data } = await dbBrut().from("ov_superadmins").select("contact").eq("contact", contact).maybeSingle();
  return data ? { uid: m.uid, contact } : null;
}

export async function journaliser(auteur: string, espace: string | null, action: string, detail = "") {
  await dbBrut().from("ov_journal_plateforme").insert({ auteur, espace_id: espace, action, detail: detail.slice(0, 500) });
}
