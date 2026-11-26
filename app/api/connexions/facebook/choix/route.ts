import { NextResponse } from "next/server";
import { chargerConnexions } from "@/lib/connexions-espace";
import { choisirPage, type PageFb } from "@/lib/facebook-connexion";

export const dynamic = "force-dynamic";
// GET → Pages en attente de choix (sans leurs jetons) ; POST { id } → la Page choisie.
export async function GET() {
  const c = await chargerConnexions();
  const pages = JSON.parse(c.FB_ATTENTE ?? "[]") as PageFb[];
  return NextResponse.json({ pages: pages.map((p) => ({ id: p.id, nom: p.name, photo: p.picture?.data?.url ?? null, instagram: p.instagram_business_account?.username ?? null })) });
}
export async function POST(req: Request) {
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const c = await chargerConnexions();
  const p = (JSON.parse(c.FB_ATTENTE ?? "[]") as PageFb[]).find((x) => x.id === id);
  if (!p) return NextResponse.json({ error: "Page introuvable : recommencez la connexion." }, { status: 404 });
  await choisirPage(p);
  return NextResponse.json({ ok: true });
}
