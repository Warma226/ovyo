// Identité de la marque de l'espace client courant (nom, présentation, site, pays, ligne éditoriale).
// Les textes de l'app contiennent des repères {{MARQUE}}, {{IDENTITE}}… remplacés ici, juste avant l'envoi à l'IA
// ou l'enregistrement d'une publication. Ainsi chaque client publie sous SON nom.
import { espaceCourant } from "./espace";
import { lireEspace } from "./plateforme";
import { crochetsIA } from "./claude";

export type Profil = { description?: string; site?: string; pays?: string; ville?: string; mission?: string; ligne?: string; secteur?: string; ton?: string; style?: string; police?: string; couleur2?: string; rubriques?: string[] };
export type Marque = { nom: string; tag: string; site: string; pays: string; identite: string; mission: string; ligne: string; logo: string | null; couleur: string; couleur2: string; police: string; style: "sobre" | "moderne" | "energique" | "institutionnel"; rubriques: string[] };

const TYPES: Record<string, string> = { media: "média", entreprise: "entreprise", agence: "agence de communication", institution: "institution" };
const TON: Record<string, string> = { formel: "formel, vouvoiement, phrases posées", chaleureux: "chaleureux, proche et simple", dynamique: "vif, accrocheur, une pointe d'humour" };
const cache = new Map<string, { at: number; m: Marque }>();

export const tagDe = (nom: string) => nom.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "") || "Ovyo";

export function construireMarque(e: { nom: string; type?: string | null; logo?: string | null; couleur?: string | null; profil?: Profil | null }): Marque {
  const p = e.profil ?? {};
  const lieu = [p.ville, p.pays].filter(Boolean).join(", ");
  const identite = `${e.nom}, ${TYPES[e.type ?? "media"] ?? "organisation"}${lieu ? ` basé(e) à ${lieu}` : ""}${p.secteur ? `, secteur : ${p.secteur}` : ""}${p.description ? ` : ${p.description}` : ""}${p.site ? ` (site : ${p.site})` : ""}.${TON[p.ton ?? ""] ? ` Ton à adopter : ${TON[p.ton ?? ""]}.` : ""}`;
  return {
    nom: e.nom,
    tag: tagDe(e.nom),
    site: (p.site ?? "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    pays: p.pays || "le pays du public",
    identite,
    mission: p.mission ?? "",
    ligne: p.ligne || "l'actualité de son secteur, expliquée simplement et ancrée dans les réalités locales de son public",
    logo: e.logo ?? null,
    couleur: e.couleur || "#2563EB",
    couleur2: p.couleur2 || "#111827",
    police: p.police || "Plus Jakarta Sans",
    style: (["sobre", "moderne", "energique", "institutionnel"].includes(p.style ?? "") ? p.style : "moderne") as Marque["style"],
    rubriques: Array.isArray(p.rubriques) ? p.rubriques : [],
  };
}

const PAR_DEFAUT = construireMarque({ nom: "Ovyo", type: "media" });

export async function marque(): Promise<Marque> {
  const E = espaceCourant();
  if (!E) return PAR_DEFAUT;
  const c = cache.get(E);
  if (c && Date.now() - c.at < 10000) return c.m; // court : chaque serveur garde sa copie
  const e = await lireEspace(E).catch(() => null);
  const m = e ? construireMarque(e as Parameters<typeof construireMarque>[0]) : PAR_DEFAUT;
  cache.set(E, { at: Date.now(), m });
  return m;
}
export function oublierMarque(espace: string) { cache.delete(espace); }

export function appliquer(texte: string, m: Marque): string {
  if (!texte || !texte.includes("{{")) return texte;
  return texte
    .replaceAll("{{MARQUE}}", m.nom)
    .replaceAll("{{TAG}}", m.tag)
    .replaceAll("{{IDENTITE}}", m.identite)
    .replaceAll("{{PAYS}}", m.pays)
    .replaceAll("{{LIGNE}}", m.ligne)
    .replaceAll("{{MISSION}}", m.mission ? `Mission : « ${m.mission} »` : "")
    .replaceAll("{{SITE}}", m.site || m.nom);
}
// Identité visuelle pour les gabarits (style, police, couleurs) de l'espace courant.
export async function marqueRendu(): Promise<import("./gabarit-rendu").MarqueRendu> {
  const m = await marque();
  return { nom: m.nom, logo: m.logo ?? undefined, site: m.site || undefined, couleur: m.couleur, couleur2: m.couleur2, police: m.police, style: m.style };
}

export async function avecMarque(texte: string): Promise<string> {
  return texte.includes("{{") ? appliquer(texte, await marque()) : texte;
}

crochetsIA.marquer = avecMarque;
