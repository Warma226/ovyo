import { NextResponse } from "next/server";
import { chargerConnexions } from "@/lib/connexions-espace";
import { chatTelegram } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// GET → état des comptes reliés de l'espace (jamais les accès eux-mêmes).
export async function GET() {
  const c = await chargerConnexions();
  return NextResponse.json({
    facebook: c.FB_PAGE_ID ? { nom: c.FB_PAGE_NOM ?? "Page Facebook", photo: c.FB_PAGE_PHOTO ?? null } : null,
    facebookEnAttente: Boolean(c.FB_ATTENTE),
    instagram: c.IG_USER_ID ? { nom: c.IG_NOM ? `@${c.IG_NOM}` : "Compte Instagram" } : null,
    wordpress: c.WP_URL ? { nom: c.WP_URL.replace(/^https?:\/\//, "") } : null,
    telegram: (await chatTelegram()) ? { nom: "Discussion reliée" } : null,
    ouverts: { facebook: Boolean(process.env.FB_APP_ID && process.env.FB_APP_SECRET), telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN) },
  });
}
