// Connexion d'une Page Facebook (et de son compte Instagram) à l'espace courant.
import { enregistrerConnexions } from "./connexions-espace";

const V = () => process.env.FB_GRAPH_VERSION || "v21.0";

export type PageFb = { id: string; name: string; access_token: string; picture?: { data?: { url?: string } }; instagram_business_account?: { id: string; username?: string } };

// Enregistre la Page choisie (et son compte Instagram relié), puis l'abonne aux notifications (commentaires → VOA).
export async function choisirPage(p: PageFb) {
  await enregistrerConnexions({
    FB_PAGE_ID: p.id, FB_PAGE_TOKEN: p.access_token, FB_PAGE_NOM: p.name, FB_PAGE_PHOTO: p.picture?.data?.url ?? null,
    IG_USER_ID: p.instagram_business_account?.id ?? null, IG_NOM: p.instagram_business_account?.username ?? null, FB_ATTENTE: null,
  });
  try {
    await fetch(`https://graph.facebook.com/${V()}/${p.id}/subscribed_apps?subscribed_fields=feed,mention&access_token=${encodeURIComponent(p.access_token)}`, { method: "POST", signal: AbortSignal.timeout(15000) });
  } catch { /* les commentaires seront relus par la tâche planifiée */ }
}

