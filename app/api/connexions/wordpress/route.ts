import { NextResponse } from "next/server";
import { chargerConnexions, enregistrerConnexions } from "@/lib/connexions-espace";

export const dynamic = "force-dynamic";

// POST { url, user, password } → vérifie l'accès au site (mot de passe d'application WordPress) puis l'enregistre.
export async function POST(req: Request) {
  await chargerConnexions();
  const b = (await req.json().catch(() => ({}))) as { url?: string; user?: string; password?: string };
  let url = (b.url ?? "").trim().replace(/\/+$/, "");
  if (url && !/^https?:\/\//.test(url)) url = `https://${url}`;
  const user = (b.user ?? "").trim(), password = (b.password ?? "").replace(/\s+/g, " ").trim();
  if (!/^https?:\/\/[^\s/]+\.[^\s]+/.test(url) || !user || password.length < 16) {
    return NextResponse.json({ error: "Indiquez l'adresse du site, votre identifiant WordPress et le mot de passe d'application (24 caractères)." }, { status: 400 });
  }
  try {
    const r = await fetch(`${url}/wp-json/wp/v2/users/me?context=edit`, { headers: { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}` }, signal: AbortSignal.timeout(15000) });
    if (r.status === 401 || r.status === 403) return NextResponse.json({ error: "Identifiant ou mot de passe d'application refusé par le site." }, { status: 400 });
    if (!r.ok) return NextResponse.json({ error: `Le site répond « ${r.status} ». Vérifiez l'adresse (l'API WordPress doit être accessible).` }, { status: 400 });
    const moi = (await r.json()) as { name?: string; capabilities?: Record<string, boolean> };
    if (moi.capabilities && !moi.capabilities.publish_posts) return NextResponse.json({ error: "Ce compte WordPress n'a pas le droit de publier des articles." }, { status: 400 });
    await enregistrerConnexions({ WP_URL: url, WP_USER: user, WP_APP_PASSWORD: password });
    return NextResponse.json({ ok: true, nom: moi.name ?? user });
  } catch (e) {
    return NextResponse.json({ error: `Site injoignable : ${(e as Error).message}` }, { status: 400 });
  }
}
