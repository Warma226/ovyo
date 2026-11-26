import { NextResponse, after } from "next/server";
import { concerneVoa, jetonVerification, reagir, signatureValide } from "@/lib/fb-temps-reel";
import { avecEspace } from "@/lib/espace";
import { chargerConnexions, espaceDePage } from "@/lib/connexions-espace";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vérification du webhook par Meta (une fois, à l'enregistrement de l'URL dans l'app Meta « Ovyo »).
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  if (q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === jetonVerification()) {
    return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Jeton de vérification incorrect" }, { status: 403 });
}

type Entree = { id?: string; changes?: { field?: string; value?: { item?: string; verb?: string; message?: string; from?: unknown } }[] };

// Notification d'une Page reliée : chaque entrée est traitée dans l'espace du client propriétaire de la Page.
export async function POST(req: Request) {
  const corps = await req.text();
  if (!signatureValide(corps, req.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  let payload: { object?: string; entry?: Entree[] } = {};
  try { payload = JSON.parse(corps); } catch { /* corps illisible */ }
  const parPage = new Map<string, Entree[]>();
  for (const e of payload.entry ?? []) if (e.id) parPage.set(e.id, [...(parPage.get(e.id) ?? []), e]);
  for (const [page, entrees] of parPage) {
    const espace = await espaceDePage(page);
    if (!espace) { console.log(`fb-webhook: Page ${page} reliée à aucun espace`); continue; }
    const morceau = { ...payload, entry: entrees } as Parameters<typeof concerneVoa>[0];
    const concerne = await avecEspace(espace, async () => { await chargerConnexions(espace); return concerneVoa(morceau); });
    console.log(`fb-webhook: Page ${page} → espace ${espace.slice(0, 8)} ${concerne ? "(VOA)" : ""}`);
    if (concerne) after(() => avecEspace(espace, async () => { await chargerConnexions(espace); try { await reagir(); } catch (e) { console.error("fb temps réel", e); } }));
  }
  return NextResponse.json({ ok: true });
}
