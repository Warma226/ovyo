import { chargerConnexions } from "@/lib/connexions-espace";
import { cle } from "@/lib/connexions-espace";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET → catégories publiques du site WordPress (nom, adresse, nombre d'articles), pour choisir où publier.
export async function GET() {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  const base = (cle("WP_URL") ?? "").replace(/\/$/, "");
  if (!base) return NextResponse.json({ error: "WP_URL manquant." }, { status: 400 });
  const res = await fetch(`${base}/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug,count,parent`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: `WordPress a répondu ${res.status}.` }, { status: 502 });
  return NextResponse.json({ categories: await res.json() });
}
