import { chargerConnexions } from "@/lib/connexions-espace";
import { NextResponse } from "next/server";
import { getSettings, saveSettings, mergeSettings, isDemo, type Settings } from "@/lib/store";
import { connectionStatus } from "@/lib/publish";
import { aiProvider } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function GET() {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  const settings = await getSettings();
  return NextResponse.json({
    settings,
    demo: isDemo(),
    ai: aiProvider() !== null,
    aiProvider: aiProvider(),
    connections: connectionStatus(),
  });
}

export async function POST(req: Request) {
  await chargerConnexions(); // comptes reliés de l\'espace (Page, site…)
  const body = (await req.json()) as Partial<Settings>;
  const current = await getSettings();
  const next: Settings = mergeSettings(current, body);
  return NextResponse.json({ settings: await saveSettings(next) });
}
