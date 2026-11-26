import { NextResponse } from "next/server";
import { secretWebhook, traiterMessage } from "@/lib/telegram-bot";
import { tg } from "@/lib/whatsapp";
import { lireCode } from "@/lib/telegram-lien";
import { avecEspace } from "@/lib/espace";
import { chargerConnexions, espaceDeChat, lierTelegram } from "@/lib/connexions-espace";
import { db } from "@/lib/store";
import { lireEspace } from "@/lib/plateforme";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Maj = { message?: { chat: { id: number; first_name?: string }; text?: string } };

// Webhook du robot Telegram d'Ovyo (signé avec le secret fixé à l'activation).
// « /start <code> » relie la discussion à l'espace du code ; les autres commandes sont traitées dans l'espace relié.
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN || req.headers.get("x-telegram-bot-api-secret-token") !== secretWebhook()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const maj = (await req.json().catch(() => ({}))) as Maj;
  const m = maj.message;
  if (!m?.text) return NextResponse.json({ ok: true });
  const chat = String(m.chat.id);
  try {
    const depart = m.text.match(/^\/start\s+(\S+)/);
    if (depart) {
      const espace = lireCode(depart[1]);
      if (!espace) { await tg("sendMessage", { chat_id: chat, text: "Lien de liaison invalide. Ouvrez Ovyo › Connexions et recommencez." }); return NextResponse.json({ ok: true }); }
      await lierTelegram(espace, chat);
      await avecEspace(espace, async () => {
        const { data } = await db().from("settings").select("data").eq("id", 9).maybeSingle();
        await db().from("settings").upsert({ id: 9, data: { ...((data?.data as object) ?? {}), telegramChat: chat } });
      });
      const e = await lireEspace(espace);
      await tg("sendMessage", { chat_id: chat, text: `✅ Ovyo · Bonjour ${m.chat.first_name ?? ""} ! Les alertes de ${e?.nom ?? "votre espace"} arriveront ici : brief du soir, posts à valider, problèmes. Tapez / pour voir les commandes.` });
      return NextResponse.json({ ok: true });
    }
    const espace = await espaceDeChat(chat);
    if (!espace) { await tg("sendMessage", { chat_id: chat, text: "Cette discussion n'est reliée à aucun espace Ovyo. Ouvrez Ovyo › Connexions › Alertes Telegram." }); return NextResponse.json({ ok: true }); }
    await avecEspace(espace, async () => { await chargerConnexions(espace); await traiterMessage(maj); });
  } catch (e) { console.error("telegram", e); }
  return NextResponse.json({ ok: true });
}
