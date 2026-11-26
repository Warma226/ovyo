import { chargerConnexions } from "@/lib/connexions-espace";
import { NextResponse } from "next/server";
import { abonnerPage, jetonVerification, pageAbonnee } from "@/lib/fb-temps-reel";

export const dynamic = "force-dynamic";

// GET → état du temps réel et réglages à saisir dans Meta. POST → abonne la Page à l'app (administration).
export async function GET(req: Request) {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  const origine = new URL(req.url).origin;
  return NextResponse.json({ actif: await pageAbonnee(), url: `${origine}/api/fb-webhook`, jeton: jetonVerification(), signature: Boolean(process.env.FB_APP_SECRET) });
}

export async function POST() {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  const r = await abonnerPage();
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
