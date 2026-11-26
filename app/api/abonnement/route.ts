import { NextResponse } from "next/server";
import { db, dbBrut } from "@/lib/store";
import { espaceCourant } from "@/lib/espace";
import { espaceOuvert, lireEspace } from "@/lib/plateforme";
import { moi } from "@/lib/equipe";
import { formuleDe } from "@/lib/formules";
import { ouvrirPaiement, paiementOuvert, produitDe } from "@/lib/chariow";
import { appUrl } from "@/lib/sign";

export const dynamic = "force-dynamic";

// GET → état de l'abonnement de l'espace, et ce qu'il faut pour pré-remplir le paiement.
export async function GET() {
  const E = espaceCourant();
  if (!E) return NextResponse.json({ error: "Espace inconnu." }, { status: 401 });
  const e = await lireEspace(E);
  if (!e) return NextResponse.json({ error: "Espace introuvable." }, { status: 404 });
  const m = await moi();
  const { data: membre } = await db().from("membres").select("nom,contact").eq("id", m.uid).maybeSingle();
  const { data: paiements } = await dbBrut().from("ov_paiements").select("formule,montant,devise,fin,created_at").eq("espace_id", E).eq("evenement", "successful.sale").order("created_at", { ascending: false }).limit(12);
  return NextResponse.json({
    statut: e.statut, formule: e.formule, ouvert: espaceOuvert(e),
    essai_fin: e.essai_fin, abonnement_fin: e.abonnement_fin,
    paiement: paiementOuvert(),
    disponibles: (["essentiel", "pro", "agence"] as const).filter((f) => produitDe(f)),
    acheteur: { nom: (membre?.nom as string) ?? "", contact: (membre?.contact as string) ?? "" },
    paiements: paiements ?? [],
  });
}

// POST { formule, prenom, nom, email, telephone, pays } → ouvre la page de paiement Chariow.
export async function POST(req: Request) {
  const E = espaceCourant();
  if (!E) return NextResponse.json({ error: "Espace inconnu." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const f = formuleDe(b.formule);
  if (!f || f.bientot) return NextResponse.json({ error: "Formule indisponible." }, { status: 400 });
  const email = (b.email ?? "").trim().toLowerCase();
  const telephone = (b.telephone ?? "").replace(/\D/g, "");
  const pays = (b.pays ?? "BF").toUpperCase();
  const prenom = (b.prenom ?? "").trim().slice(0, 50), nom = (b.nom ?? "").trim().slice(0, 50);
  if (!prenom || !nom) return NextResponse.json({ error: "Indiquez votre prénom et votre nom." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Indiquez une adresse e-mail valide : Chariow y envoie le reçu." }, { status: 400 });
  if (telephone.length < 8) return NextResponse.json({ error: "Indiquez le numéro Mobile Money qui va payer." }, { status: 400 });
  if (!/^[A-Z]{2}$/.test(pays)) return NextResponse.json({ error: "Pays invalide." }, { status: 400 });
  try {
    const url = await ouvrirPaiement({
      formule: f.id, espace: E, retour: `${appUrl()}/abonnement?retour=1`,
      acheteur: { email, prenom, nom, telephone, pays },
      ip: req.headers.get("cf-connecting-ip"),
    });
    return NextResponse.json({ url });
  } catch (x) {
    return NextResponse.json({ error: (x as Error).message }, { status: 502 });
  }
}
