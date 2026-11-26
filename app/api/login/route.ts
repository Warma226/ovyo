import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession } from "@/lib/session";
import { appareilDe, membreConnexion, ouvrirSession, verifier } from "@/lib/equipe";
import { avecEspace } from "@/lib/espace";

export const dynamic = "force-dynamic";

const pause = () => new Promise((r) => setTimeout(r, 800)); // freine les essais en série

// POST { contact, password } → cookie de session (30 jours), rattaché à l'espace client du membre.
export async function POST(req: Request) {
  const { password, contact } = (await req.json().catch(() => ({}))) as { password?: string; contact?: string };
  if (!process.env.APP_SECRET) return NextResponse.json({ error: "Ovyo n'est pas encore configuré (APP_SECRET manquant)." }, { status: 503 });
  if (!contact?.trim() || !password) return NextResponse.json({ error: "Entrez votre e-mail (ou téléphone) et votre mot de passe." }, { status: 400 });
  const m = await membreConnexion(contact).catch(() => null);
  if (!m || m.statut !== "actif" || !verifier(password, m.mdp_hash)) {
    await pause();
    return NextResponse.json({ error: m?.statut === "suspendu" ? "Ce compte est suspendu. Contactez l'administrateur de votre espace." : "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  const sid = await avecEspace(m.espace_id, () => ouvrirSession(m.id, appareilDe(req.headers.get("user-agent") ?? "")));
  const session = await createSession(m.id, m.role, sid, m.espace_id);
  const res = NextResponse.json({ ok: true, role: m.role });
  res.cookies.set(SESSION_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: session.maxAge });
  return res;
}
