import { NextResponse } from "next/server";
import { chargerConnexions, enregistrerConnexions, lierTelegram } from "@/lib/connexions-espace";
import { espaceCourant } from "@/lib/espace";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

const CANAUX = {
  facebook: ["FB_PAGE_ID", "FB_PAGE_TOKEN", "FB_PAGE_NOM", "FB_PAGE_PHOTO", "IG_USER_ID", "IG_NOM", "FB_ATTENTE"],
  wordpress: ["WP_URL", "WP_USER", "WP_APP_PASSWORD"],
} as const;

// POST { canal } → déconnecte le compte (les accès sont effacés d'Ovyo).
export async function POST(req: Request) {
  await chargerConnexions();
  const { canal } = (await req.json().catch(() => ({}))) as { canal?: string };
  if (canal === "telegram") {
    const e = espaceCourant();
    if (e) await lierTelegram(e, null);
    const { data } = await db().from("settings").select("data").eq("id", 9).maybeSingle();
    const d = { ...((data?.data as Record<string, unknown>) ?? {}) }; delete d.telegramChat;
    await db().from("settings").upsert({ id: 9, data: d });
    return NextResponse.json({ ok: true });
  }
  const cles = CANAUX[canal as keyof typeof CANAUX];
  if (!cles) return NextResponse.json({ error: "Canal inconnu." }, { status: 400 });
  await enregistrerConnexions(Object.fromEntries(cles.map((k) => [k, null])));
  return NextResponse.json({ ok: true });
}
