// Espace administrateur de la plateforme : tous les espaces clients, leur abonnement, les paiements, et quelques actions.
import { NextResponse } from "next/server";
import { dbBrut } from "@/lib/store";
import { espaceOuvert, lireEspace } from "@/lib/plateforme";
import { superAdmin, journaliser } from "@/lib/superadmin";
import { formuleDe } from "@/lib/formules";

export const dynamic = "force-dynamic";
const JOUR = 864e5;

type Ligne = { id: string; nom: string; slug: string; type: string | null; statut: string; formule: string; essai_fin: string | null; abonnement_fin: string | null; created_at: string; logo: string | null; couleur: string | null };

export async function GET(req: Request) {
  const sa = await superAdmin();
  if (!sa) return NextResponse.json({ error: "Accès réservé à l'administration d'Ovyo." }, { status: 403 });
  if (new URL(req.url).searchParams.get("verifier")) return NextResponse.json({ ok: true });
  const b = dbBrut();
  const debutMois = new Date(); debutMois.setUTCDate(1); debutMois.setUTCHours(0, 0, 0, 0);
  const il30 = new Date(Date.now() - 30 * JOUR).toISOString();

  const [esp, mem, posts, cnx, pay, jour] = await Promise.all([
    b.from("ov_espaces").select("id,nom,slug,type,statut,formule,essai_fin,abonnement_fin,created_at,logo,couleur").order("created_at", { ascending: false }).limit(1000),
    b.from("ov_membres").select("espace_id,nom,contact,role,statut,derniere_connexion").limit(5000),
    b.from("ov_posts").select("espace_id,status,created_at").gte("created_at", il30).in("status", ["planifie", "publie"]).limit(20000),
    b.from("ov_connexions").select("espace_id,fb_page_id,tg_chat_id,data").limit(2000),
    b.from("ov_paiements").select("espace_id,formule,montant,devise,evenement,fin,created_at,vente").order("created_at", { ascending: false }).limit(500),
    b.from("ov_journal_plateforme").select("auteur,espace_id,action,detail,created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  if (esp.error) return NextResponse.json({ error: esp.error.message }, { status: 500 });

  const membres = new Map<string, { admin: { nom: string; contact: string } | null; total: number; vu: string | null }>();
  for (const m of mem.data ?? []) {
    const e = membres.get(m.espace_id) ?? { admin: null, total: 0, vu: null };
    e.total++;
    if (m.role === "admin" && !e.admin) e.admin = { nom: m.nom, contact: m.contact };
    if (m.derniere_connexion && (!e.vu || m.derniere_connexion > e.vu)) e.vu = m.derniere_connexion;
    membres.set(m.espace_id, e);
  }
  const nbPosts = new Map<string, number>();
  for (const p of posts.data ?? []) nbPosts.set(p.espace_id, (nbPosts.get(p.espace_id) ?? 0) + 1);
  const canaux = new Map<string, string[]>();
  for (const c of cnx.data ?? []) {
    const l: string[] = [];
    if (c.fb_page_id) l.push("Facebook");
    if (c.tg_chat_id) l.push("Telegram");
    if (c.data) l.push("…");
    canaux.set(c.espace_id, l);
  }
  const ventes = (pay.data ?? []).filter((p) => p.evenement === "successful.sale" && p.espace_id);
  const xof = (p: { devise: string | null }) => !p.devise || p.devise === "XOF";
  const revenuMois = ventes.filter((p) => xof(p) && p.created_at >= debutMois.toISOString()).reduce((s, p) => s + Number(p.montant ?? 0), 0);
  const revenuTotal = ventes.filter(xof).reduce((s, p) => s + Number(p.montant ?? 0), 0);

  const espaces = ((esp.data ?? []) as Ligne[]).map((e) => {
    const m = membres.get(e.id);
    const fin = e.statut === "actif" ? e.abonnement_fin : e.essai_fin;
    const ouvert = espaceOuvert(e as Parameters<typeof espaceOuvert>[0]);
    const etat = e.statut === "suspendu" || e.statut === "resilie" ? "suspendu" : !ouvert ? "expire" : e.statut === "actif" ? "actif" : "essai";
    return {
      ...e, etat, ouvert, fin,
      jours: fin ? Math.ceil((new Date(fin).getTime() - Date.now()) / JOUR) : null,
      admin: m?.admin ?? null, membres: m?.total ?? 0, derniere_connexion: m?.vu ?? null,
      posts30: nbPosts.get(e.id) ?? 0, canaux: (canaux.get(e.id) ?? []).filter((x) => x !== "…"),
      paye: ventes.filter((p) => p.espace_id === e.id).reduce((s, p) => s + Number(p.montant ?? 0), 0),
    };
  });
  const compte = (k: string) => espaces.filter((e) => e.etat === k).length;
  return NextResponse.json({
    chiffres: {
      espaces: espaces.length, essai: compte("essai"), actifs: compte("actif"), expires: compte("expire"), suspendus: compte("suspendu"),
      revenuMois, revenuTotal, nouveaux30: espaces.filter((e) => e.created_at >= il30).length,
      parFormule: { essentiel: espaces.filter((e) => e.etat === "actif" && e.formule === "essentiel").length, pro: espaces.filter((e) => e.etat === "actif" && e.formule === "pro").length },
    },
    espaces,
    paiements: (pay.data ?? []).filter((p) => p.evenement === "successful.sale").slice(0, 60).map((p) => ({ ...p, espace: espaces.find((e) => e.id === p.espace_id)?.nom ?? null })),
    journal: (jour.data ?? []).map((j) => ({ ...j, espace: espaces.find((e) => e.id === j.espace_id)?.nom ?? null })),
  });
}

// POST { espace, action: "prolonger" (jours, formule) | "essai" (jours) | "suspendre" | "reactiver" }
export async function POST(req: Request) {
  const sa = await superAdmin();
  if (!sa) return NextResponse.json({ error: "Accès réservé à l'administration d'Ovyo." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { espace?: string; action?: string; jours?: number; formule?: string };
  const e = b.espace ? await lireEspace(b.espace) : null;
  if (!e) return NextResponse.json({ error: "Espace introuvable." }, { status: 404 });
  const jours = Math.max(1, Math.min(366, Math.round(Number(b.jours) || 0)));
  const maj: Record<string, unknown> = {};
  let detail = "";

  if (b.action === "prolonger") {
    const f = formuleDe(b.formule);
    if (!f) return NextResponse.json({ error: "Formule inconnue." }, { status: 400 });
    const base = e.statut === "actif" && e.abonnement_fin && new Date(e.abonnement_fin).getTime() > Date.now() ? new Date(e.abonnement_fin).getTime() : Date.now();
    maj.statut = "actif"; maj.formule = f.id; maj.abonnement_fin = new Date(base + jours * JOUR).toISOString();
    detail = `${f.nom} +${jours} j (jusqu'au ${(maj.abonnement_fin as string).slice(0, 10)})`;
  } else if (b.action === "essai") {
    const base = e.essai_fin && new Date(e.essai_fin).getTime() > Date.now() ? new Date(e.essai_fin).getTime() : Date.now();
    maj.statut = "essai"; maj.essai_fin = new Date(base + jours * JOUR).toISOString();
    detail = `essai +${jours} j (jusqu'au ${(maj.essai_fin as string).slice(0, 10)})`;
  } else if (b.action === "suspendre") {
    maj.statut = "suspendu"; detail = "espace suspendu";
  } else if (b.action === "reactiver") {
    const actif = e.abonnement_fin && new Date(e.abonnement_fin).getTime() > Date.now();
    maj.statut = actif ? "actif" : "essai"; detail = `espace réactivé (${maj.statut})`;
  } else {
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  }
  const { error } = await dbBrut().from("ov_espaces").update(maj).eq("id", e.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await journaliser(sa.contact, e.id, b.action, detail);
  return NextResponse.json({ ok: true, detail });
}
