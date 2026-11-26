import { chargerConnexions } from "@/lib/connexions-espace";
import { NextResponse } from "next/server";
import { testConnections } from "@/lib/publish";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET → vérifie chaque compte relié, sans rien publier.
export async function GET() {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  return NextResponse.json({ results: await testConnections() });
}
