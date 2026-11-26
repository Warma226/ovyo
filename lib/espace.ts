// Ovyo est multi-clients : chaque client a son « espace ». Toutes les données (posts, réglages, journal de VOA…)
// sont rangées dans les tables ov_* avec la colonne espace_id, et db() ne voit que l'espace courant.
// Espace courant : celui d'une tâche planifiée (avecEspace) ou celui de la session (en-tête posé par le middleware).
import { AsyncLocalStorage } from "node:async_hooks";
import { headers } from "next/headers";

const contexte = new AsyncLocalStorage<string>();
export const ENTETE_ESPACE = "x-ovyo-espace";

export function avecEspace<T>(espace: string, f: () => Promise<T>): Promise<T> {
  return contexte.run(espace, f);
}

export function espaceCourant(): string | null {
  const e = contexte.getStore();
  if (e) return e;
  try {
    // Next 15 : lecture directe des en-têtes de la requête en cours (route ou page serveur).
    const h = headers() as unknown as Headers;
    return h.get?.(ENTETE_ESPACE) || null;
  } catch {
    return null;
  }
}
