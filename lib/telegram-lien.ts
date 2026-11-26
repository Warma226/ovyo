// Liaison Telegram multi-clients : un seul robot Ovyo, chaque espace relie sa discussion avec un lien personnel
// (t.me/<robot>?start=<code signé>). Les commandes reçues sont ensuite traitées dans l'espace de la discussion.
import { createHmac, timingSafeEqual } from "node:crypto";
import { tg } from "./whatsapp";
import { activerCommandes } from "./telegram-bot";

const sig = (e: string) => createHmac("sha256", process.env.APP_SECRET ?? "").update(`ovyo-tg:${e}`).digest("base64url").slice(0, 16);
export const codeLiaison = (espace: string) => `${espace}_${sig(espace)}`;
export function lireCode(code: string): string | null {
  const [e, s] = code.split("_");
  if (!e || !s) return null;
  const a = Buffer.from(sig(e)), b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b) ? e : null;
}

let robot: string | null = null;
let branche = false;
// Nom du robot (pour le lien) ; branche le webhook la première fois.
export async function nomRobot(): Promise<string | null> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return null;
  if (!robot) {
    const r = await tg("getMe");
    robot = r.ok ? ((r.result as { username?: string }).username ?? null) : null;
  }
  if (!branche) { const a = await activerCommandes().catch(() => ({ ok: false })); branche = a.ok; }
  return robot;
}
