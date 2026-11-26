import { NextResponse } from "next/server";
import { marque } from "@/lib/marque";
import { lireEspace } from "@/lib/plateforme";
import { espaceCourant } from "@/lib/espace";

export const dynamic = "force-dynamic";

// GET → identité de l'espace connecté (nom, site, logo, couleur), pour l'affichage dans l'app.
export async function GET() {
  const m = await marque();
  const e = espaceCourant() ? await lireEspace(espaceCourant() as string) : null;
  return NextResponse.json({
    nom: m.nom, tag: m.tag, site: m.site, logo: m.logo, couleur: m.couleur,
    statut: e?.statut ?? null, essai_fin: e?.essai_fin ?? null,
  });
}
