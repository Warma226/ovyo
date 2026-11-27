// Protège toute l'application : sans session valide, on est envoyé vers l'écran de connexion (/acces).
// Chaque membre de l'équipe n'ouvre que les pages et les actions de son rôle (lib/roles).
// Exceptions : l'écran de connexion, l'inscription, l'invitation, la tâche planifiée (clé CRON_SECRET) et les visuels signés.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { apiAutorisee, pageAutorisee } from "@/lib/roles";

// Le middleware passe partout (sauf fichiers statiques) : même sur les pages publiques, il efface les en-têtes
// x-ovyo-* envoyés par le navigateur, pour qu'on ne puisse jamais se faire passer pour un autre espace client.
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|ovyo-logo.svg|accueil-marque.jpg).*)"] };
const PUBLIC = /^\/(api\/gabarit$|api\/cron|api\/cm-cron|api\/telegram|api\/fb-webhook|api\/chariow$|api\/visuel|api\/login|api\/vitrine|api\/invitation|invitation|inscription|api\/inscription|studio\/|recap\/|cyberbase\/|citations\/|wp\/|api\/wp-categories|api\/media|cgu|confidentialite|decouvrir|tiktok)/;
const ENTETES = ["x-ovyo-uid", "x-ovyo-role", "x-ovyo-sid", "x-ovyo-espace"];

// Sessions encore ouvertes (déconnexion d'un appareil, membre suspendu ou retiré) : vérifié en base, gardé 60 s.
const vues = new Map<string, { ok: boolean; at: number }>();
async function sessionOuverte(sid: string, espace: string): Promise<boolean> {
  const cleCache = `${espace}:${sid}`;
  const c = vues.get(cleCache);
  if (c && Date.now() - c.at < 60000) return c.ok;
  const url = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return true;
  try {
    const r = await fetch(`${url}/rest/v1/ov_sessions?id=eq.${encodeURIComponent(sid)}&espace_id=eq.${encodeURIComponent(espace)}&select=id`, { headers: { apikey: cle, Authorization: `Bearer ${cle}` }, cache: "no-store" });
    const ok = r.ok ? ((await r.json()) as unknown[]).length > 0 : true;
    vues.set(cleCache, { ok, at: Date.now() });
    if (vues.size > 500) vues.clear();
    return ok;
  } catch {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const h = new Headers(req.headers);
  for (const e of ENTETES) h.delete(e);
  if (PUBLIC.test(pathname)) return NextResponse.next({ request: { headers: h } });
  if (!process.env.APP_SECRET) {
    return new NextResponse("Ovyo est en cours d'installation. Revenez dans quelques minutes.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  let s = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (s?.sid && !(await sessionOuverte(s.sid, s.espace))) s = null;
  if (pathname === "/acces") return s ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  if (!s) {
    // Visiteur sans session sur l'adresse principale : la page d'accueil publique.
    if (pathname === "/") return NextResponse.rewrite(new URL("/decouvrir", req.url), { request: { headers: h } });
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Session expirée : recharge la page et reconnecte-toi." }, { status: 401 });
    const url = new URL("/acces", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (req.cookies.get(SESSION_COOKIE)) res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
  if (pathname.startsWith("/api/")) {
    if (!apiAutorisee(s.role, pathname, req.method)) return NextResponse.json({ error: "Cette action est réservée à un autre rôle de l'équipe." }, { status: 403 });
  } else if (!pageAutorisee(s.role, pathname)) {
    return NextResponse.redirect(new URL("/compte?refus=1", req.url));
  }
  // Identité transmise aux routes (les en-têtes envoyés par le navigateur sont écrasés).
  h.set("x-ovyo-uid", s.uid);
  h.set("x-ovyo-role", s.role);
  h.set("x-ovyo-sid", s.sid ?? "");
  h.set("x-ovyo-espace", s.espace);
  return NextResponse.next({ request: { headers: h } });
}
