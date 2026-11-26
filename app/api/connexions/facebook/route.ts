import { NextResponse } from "next/server";
import { espaceCourant } from "@/lib/espace";
import { moi } from "@/lib/equipe";
import { creerEtat } from "@/lib/oauth";
import { appUrl } from "@/lib/sign";

export const dynamic = "force-dynamic";
const V = () => process.env.FB_GRAPH_VERSION || "v21.0";
// Autorisations demandées : publier sur la Page et Instagram, lire et répondre aux commentaires (VOA).
const SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "pages_manage_engagement", "pages_read_user_content", "pages_manage_metadata", "instagram_basic", "instagram_content_publish", "business_management"];

// GET → page officielle de Facebook pour autoriser Ovyo (bouton « Connecter Facebook »).
export async function GET() {
  const espace = espaceCourant();
  if (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET) return NextResponse.redirect(`${appUrl()}/connexions?erreur=${encodeURIComponent("La connexion Facebook n'est pas encore ouverte sur Ovyo.")}`);
  if (!espace) return NextResponse.redirect(`${appUrl()}/acces`);
  const u = new URL(`https://www.facebook.com/${V()}/dialog/oauth`);
  u.searchParams.set("client_id", process.env.FB_APP_ID);
  u.searchParams.set("redirect_uri", `${appUrl()}/api/connexions/facebook/retour`);
  u.searchParams.set("state", creerEtat(espace, (await moi()).uid));
  u.searchParams.set("scope", SCOPES.join(","));
  return NextResponse.redirect(u.toString());
}
