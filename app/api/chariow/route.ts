// Avis de paiement Chariow (« Pulse ») : appelé par Chariow, jamais par l'app.
// Signature vérifiée sur le corps brut, puis chaque avis n'est traité qu'une fois (x-pulse-delivery-id).
import { NextResponse } from "next/server";
import { dbBrut } from "@/lib/store";
import { formuleDuProduit, pulseValide } from "@/lib/chariow";
import { formuleDe } from "@/lib/formules";
import { lireEspace, prolongerAbonnement } from "@/lib/plateforme";

export const dynamic = "force-dynamic";

type Pulse = {
  event?: string; note?: string;
  sale?: { id?: string; status?: string; amount?: { value?: number; currency?: string }; custom_metadata?: Record<string, string> | null };
  product?: { id?: string; url?: string };
};

export async function POST(req: Request) {
  const brut = Buffer.from(await req.arrayBuffer());
  if (!pulseValide(brut, req.headers.get("x-chariow-signature"))) return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  const livraison = req.headers.get("x-pulse-delivery-id") ?? "";
  const evenement = req.headers.get("x-pulse-event") ?? "";
  let p: Pulse;
  try { p = JSON.parse(brut.toString("utf8")); } catch { return NextResponse.json({ error: "Corps illisible" }, { status: 400 }); }
  if (!livraison) return NextResponse.json({ error: "Avis sans identifiant" }, { status: 400 });


  const meta = p.sale?.custom_metadata ?? {};
  const espace = typeof meta.espace === "string" ? meta.espace : "";
  const formule = formuleDuProduit(p.product) ?? (formuleDe(meta.formule)?.id);
  const ligne = { livraison, espace_id: null as string | null, vente: p.sale?.id ?? null, formule: formule ?? null, montant: p.sale?.amount?.value ?? null, devise: p.sale?.amount?.currency ?? null, evenement: evenement || p.event || "", fin: null as string | null };

  // On réserve l'avis avant de le traiter : un avis déjà reçu (Chariow réessaie pendant près de 3 h) est ignoré.
  const { error: pris } = await dbBrut().from("ov_paiements").insert(ligne);
  if (pris) {
    if (/duplicate|unique/i.test(pris.message)) return NextResponse.json({ ok: true, deja: true });
    console.error("chariow: enregistrement", pris.message);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 }); // Chariow réessaiera
  }

  if ((evenement || p.event) === "successful.sale" && p.sale?.status !== "failed" && !p.note) {
    const e = espace ? await lireEspace(espace) : null;
    if (!e || !formule) {
      // Vente hors Ovyo (autre produit de la boutique) ou sans espace : on la note et on l'ignore.
      console.warn("chariow: vente sans espace ou formule", p.sale?.id);
    } else {
      // Le produit payé doit correspondre à la formule demandée et le montant ne doit pas être inférieur au prix.
      const f = formuleDe(formule);
      const montant = p.sale?.amount?.value ?? 0;
      if (f && p.sale?.amount?.currency === "XOF" && montant < f.prix) {
        console.error("chariow: montant inférieur au prix", p.sale?.id, montant, f.prix);
      } else {
        ligne.espace_id = e.id;
        ligne.fin = await prolongerAbonnement(e.id, formule);
        console.log(`chariow: ${e.slug} → ${formule} jusqu'au ${ligne.fin}`);
      }
    }
  }
  if (ligne.fin) await dbBrut().from("ov_paiements").update({ espace_id: ligne.espace_id, fin: ligne.fin }).eq("livraison", livraison);
  return NextResponse.json({ ok: true });
}
