import { NextResponse } from "next/server";
import { espaceCourant } from "@/lib/espace";
import { codeLiaison, nomRobot } from "@/lib/telegram-lien";

export const dynamic = "force-dynamic";

// GET → lien personnel pour relier la discussion Telegram de cet espace aux alertes d'Ovyo.
export async function GET() {
  const espace = espaceCourant();
  if (!espace) return NextResponse.json({ error: "Espace inconnu." }, { status: 401 });
  const robot = await nomRobot();
  if (!robot) return NextResponse.json({ error: "Les alertes Telegram ne sont pas encore ouvertes sur Ovyo." }, { status: 503 });
  return NextResponse.json({ lien: `https://t.me/${robot}?start=${codeLiaison(espace)}`, robot });
}
