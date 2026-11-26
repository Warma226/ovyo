// Paramètre « state » signé des connexions (Facebook…) : l'espace et le membre qui ont lancé la connexion, valable 15 min.
import { createHmac, timingSafeEqual } from "node:crypto";

const sig = (s: string) => createHmac("sha256", process.env.APP_SECRET ?? "").update(`ovyo-oauth:${s}`).digest("base64url").slice(0, 32);

export function creerEtat(espace: string, uid: string): string {
  const corps = `${espace}.${uid}.${Date.now() + 15 * 60000}`;
  return `${corps}.${sig(corps)}`;
}
export function lireEtat(etat: string | null): { espace: string; uid: string } | null {
  const p = (etat ?? "").split(".");
  if (p.length !== 4) return null;
  const corps = p.slice(0, 3).join(".");
  const a = Buffer.from(sig(corps)), b = Buffer.from(p[3]);
  if (a.length !== b.length || !timingSafeEqual(a, b) || Number(p[2]) < Date.now()) return null;
  return { espace: p[0], uid: p[1] };
}
