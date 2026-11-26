import { NextResponse } from "next/server";
import { dbBrut } from "@/lib/store";
import { espaceCourant } from "@/lib/espace";
import { lireEspace } from "@/lib/plateforme";
import { oublierMarque } from "@/lib/marque";

export const dynamic = "force-dynamic";

const CHAMPS_PROFIL = ["secteur", "pays", "ville", "site", "description", "mission", "ligne", "ton", "style", "police", "couleur2", "rubriques", "configure"] as const;
const COULEUR = /^#[0-9a-fA-F]{6}$/;

// GET → l'espace connecté et ses réglages de marque.
export async function GET() {
  const E = espaceCourant();
  if (!E) return NextResponse.json({ error: "Espace inconnu." }, { status: 401 });
  const e = await lireEspace(E);
  if (!e) return NextResponse.json({ error: "Espace introuvable." }, { status: 404 });
  return NextResponse.json({ nom: e.nom, type: e.type, logo: e.logo, couleur: e.couleur, profil: e.profil ?? {}, statut: e.statut, essai_fin: e.essai_fin });
}

// PATCH { nom?, type?, logo?, couleur?, profil? } → met à jour l'identité de l'espace (administrateur seulement).
export async function PATCH(req: Request) {
  const E = espaceCourant();
  if (!E) return NextResponse.json({ error: "Espace inconnu." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const actuel = await lireEspace(E);
  if (!actuel) return NextResponse.json({ error: "Espace introuvable." }, { status: 404 });
  const maj: Record<string, unknown> = {};
  if (typeof b.nom === "string" && b.nom.trim().length >= 2) maj.nom = b.nom.trim().slice(0, 80);
  if (typeof b.type === "string" && ["media", "entreprise", "agence", "institution"].includes(b.type)) maj.type = b.type;
  if (typeof b.logo === "string") maj.logo = b.logo.trim().slice(0, 600) || null;
  if (typeof b.couleur === "string" && COULEUR.test(b.couleur)) maj.couleur = b.couleur;
  if (b.profil && typeof b.profil === "object") {
    const p = { ...(actuel.profil ?? {}) } as Record<string, unknown>;
    for (const k of CHAMPS_PROFIL) {
      const v = (b.profil as Record<string, unknown>)[k];
      if (v === undefined) continue;
      if (k === "rubriques") p[k] = Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 40) : [];
      else if (k === "configure") p[k] = Boolean(v);
      else if (k === "couleur2") { if (typeof v === "string" && COULEUR.test(v)) p[k] = v; }
      else if (typeof v === "string") p[k] = v.trim().slice(0, k === "description" || k === "ligne" ? 400 : 120);
    }
    maj.profil = p;
  }
  if (!Object.keys(maj).length) return NextResponse.json({ ok: true });
  const { error } = await dbBrut().from("ov_espaces").update(maj).eq("id", E);
  if (error) return NextResponse.json({ error: "Enregistrement impossible. Réessayez." }, { status: 500 });
  oublierMarque(E);
  return NextResponse.json({ ok: true });
}
