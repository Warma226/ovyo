import { NextResponse } from "next/server";
import { lireEtat } from "@/lib/oauth";
import { appUrl } from "@/lib/sign";
import { avecEspace, espaceCourant } from "@/lib/espace";
import { enregistrerConnexions } from "@/lib/connexions-espace";
import { choisirPage, type PageFb } from "@/lib/facebook-connexion";

export const dynamic = "force-dynamic";
const V = () => process.env.FB_GRAPH_VERSION || "v21.0";
const retour = (q: string) => NextResponse.redirect(`${appUrl()}/connexions?${q}`);

async function fb<T>(chemin: string, params: Record<string, string>): Promise<T> {
  const u = new URL(`https://graph.facebook.com/${V()}/${chemin}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  const d = (await r.json()) as T & { error?: { message?: string } };
  if (!r.ok || d.error) throw new Error(d.error?.message ?? `Facebook ${r.status}`);
  return d;
}

// GET ?code&state → échange le code, récupère les Pages du client (accès longue durée) et les enregistre dans SON espace.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  if (q.get("error")) return retour(`erreur=${encodeURIComponent("Connexion Facebook annulée.")}`);
  const etat = lireEtat(q.get("state"));
  if (!etat || etat.espace !== espaceCourant()) return retour(`erreur=${encodeURIComponent("Lien de connexion expiré : recommencez.")}`);
  try {
    const app = { client_id: process.env.FB_APP_ID ?? "", client_secret: process.env.FB_APP_SECRET ?? "" };
    const court = await fb<{ access_token: string }>("oauth/access_token", { ...app, redirect_uri: `${appUrl()}/api/connexions/facebook/retour`, code: q.get("code") ?? "" });
    const long = await fb<{ access_token: string }>("oauth/access_token", { ...app, grant_type: "fb_exchange_token", fb_exchange_token: court.access_token });
    const { data } = await fb<{ data: PageFb[] }>("me/accounts", { access_token: long.access_token, fields: "id,name,access_token,picture{url},instagram_business_account{id,username}", limit: "50" });
    if (!data?.length) return retour(`erreur=${encodeURIComponent("Aucune Page trouvée : vérifiez que vous êtes administrateur d'une Page Facebook et cochez-la à l'étape d'autorisation.")}`);
    return await avecEspace(etat.espace, async () => {
      if (data.length === 1) { await choisirPage(data[0]); return retour("ok=facebook"); }
      await enregistrerConnexions({ FB_ATTENTE: JSON.stringify(data) });
      return retour("choix=facebook");
    });
  } catch (e) {
    return retour(`erreur=${encodeURIComponent(`Facebook : ${(e as Error).message}`)}`);
  }
}
