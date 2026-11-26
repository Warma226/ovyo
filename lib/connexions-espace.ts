// Comptes reliés par chaque client (Page Facebook, site WordPress, Telegram…) : stockés chiffrés, un enregistrement par espace.
// Le code lit ces accès avec cle("FB_PAGE_TOKEN") au lieu des variables d'environnement : chaque espace publie
// sur SES comptes, jamais sur ceux d'un autre. chargerConnexions() doit avoir été appelé dans la requête (fait pour
// les routes de l'app et les tâches planifiées).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { dbBrut } from "./store";
import { espaceCourant } from "./espace";

export const CLES_ESPACE = [
  "FB_PAGE_ID", "FB_PAGE_TOKEN", "FB_PAGE_NOM", "FB_PAGE_PHOTO", "IG_USER_ID", "IG_NOM",
  "WP_URL", "WP_USER", "WP_APP_PASSWORD",
  "LINKEDIN_WEBHOOK_URL", "LINKEDIN_TOKEN", "LINKEDIN_AUTHOR",
  "FB_ATTENTE", // Pages proposées après « Connecter Facebook », en attente du choix du client
] as const;
export type CleEspace = (typeof CLES_ESPACE)[number];
type Cles = Partial<Record<CleEspace, string>>;
const PAR_ESPACE = new Set<string>(CLES_ESPACE);

const cache = new Map<string, { at: number; c: Cles }>();
const cleChiffre = () => createHash("sha256").update(`ovyo-connexions:${process.env.APP_SECRET ?? ""}`).digest();

function chiffrer(o: Cles): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", cleChiffre(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(o), "utf8"), c.final()]);
  return `v1.${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;
}
function dechiffrer(s: string | null): Cles {
  if (!s?.startsWith("v1.")) return {};
  try {
    const [, iv, tag, enc] = s.split(".");
    const d = createDecipheriv("aes-256-gcm", cleChiffre(), Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return JSON.parse(Buffer.concat([d.update(Buffer.from(enc, "base64url")), d.final()]).toString("utf8")) as Cles;
  } catch {
    return {};
  }
}

export async function chargerConnexions(espace: string | null = espaceCourant()): Promise<Cles> {
  if (!espace) return {};
  const c = cache.get(espace);
  if (c && Date.now() - c.at < 30000) return c.c;
  const { data } = await dbBrut().from("ov_connexions").select("data").eq("espace_id", espace).maybeSingle();
  const cles = dechiffrer((data?.data as string | null) ?? null);
  cache.set(espace, { at: Date.now(), c: cles });
  return cles;
}

// Lecture synchrone : accès du client pour les clés propres à chaque espace, variable d'environnement pour le reste.
export function cle(nom: string): string | undefined {
  if (!PAR_ESPACE.has(nom)) return process.env[nom];
  const e = espaceCourant();
  return e ? cache.get(e)?.c[nom as CleEspace] || undefined : undefined;
}

// Ajoute, remplace ou retire (valeur null) des accès de l'espace courant.
export async function enregistrerConnexions(maj: Partial<Record<CleEspace, string | null>>): Promise<void> {
  const espace = espaceCourant();
  if (!espace) throw new Error("Espace inconnu.");
  cache.delete(espace);
  const actuelles = await chargerConnexions(espace);
  const suivantes: Cles = { ...actuelles };
  for (const [k, v] of Object.entries(maj)) {
    if (v === null || v === "") delete suivantes[k as CleEspace]; else suivantes[k as CleEspace] = v as string;
  }
  const { error } = await dbBrut().from("ov_connexions").upsert({
    espace_id: espace, data: chiffrer(suivantes), fb_page_id: suivantes.FB_PAGE_ID ?? null, maj: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  cache.set(espace, { at: Date.now(), c: suivantes });
}

export async function lierTelegram(espace: string, chat: string | null) {
  await dbBrut().from("ov_connexions").upsert({ espace_id: espace, tg_chat_id: chat, maj: new Date().toISOString() }, { onConflict: "espace_id" });
}

// Webhooks : retrouver l'espace d'une Page Facebook ou d'une discussion Telegram.
export async function espaceDePage(pageId: string): Promise<string | null> {
  const { data } = await dbBrut().from("ov_connexions").select("espace_id").eq("fb_page_id", pageId).limit(1).maybeSingle();
  return (data?.espace_id as string) ?? null;
}
export async function espaceDeChat(chat: string): Promise<string | null> {
  const { data } = await dbBrut().from("ov_connexions").select("espace_id").eq("tg_chat_id", chat).limit(1).maybeSingle();
  return (data?.espace_id as string) ?? null;
}
