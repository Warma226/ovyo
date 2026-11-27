// Paiement des abonnements Ovyo via Chariow (Mobile Money, carte).
// Côté serveur uniquement. Clés de la plateforme (secrets Cloudflare) :
//   CHARIOW_API_KEY        clé API (sk_live_…) pour ouvrir une page de paiement
//   CHARIOW_PULSE_SECRET   secret de signature du Pulse (whsec_…) pour vérifier les avis de paiement
//   CHARIOW_PRODUIT_ESSENTIEL / _PRO / _AGENCE   (facultatif) remplace l'identifiant du produit Chariow de chaque formule
import { createHmac, timingSafeEqual } from "node:crypto";
import type { FormuleId } from "./formules";

const API = "https://api.chariow.com/v1";

// Produits de la boutique Chariow (otbbljjy.mychariow.shop).
const PRODUITS: Partial<Record<FormuleId, string>> = { essentiel: "prd_g9axfd8o", pro: "prd_iz51l1xm" };

export function produitDe(f: FormuleId): string | undefined {
  return process.env[`CHARIOW_PRODUIT_${f.toUpperCase()}`]?.trim() || PRODUITS[f];
}
export function formuleDuProduit(produit: { id?: string; url?: string } | undefined): FormuleId | undefined {
  if (!produit) return undefined;
  for (const f of ["essentiel", "pro", "agence"] as FormuleId[]) {
    const p = produitDe(f);
    if (p && (produit.id === p || produit.url?.replace(/\/$/, "").endsWith(`/${p}`))) return f;
  }
  return undefined;
}
export const paiementOuvert = () => Boolean(process.env.CHARIOW_API_KEY && process.env.CHARIOW_PULSE_SECRET);

export type Acheteur = { email: string; prenom: string; nom: string; telephone: string; pays: string };

// Ouvre une page de paiement Chariow ; renvoie l'adresse où envoyer le client.
export async function ouvrirPaiement(p: { formule: FormuleId; espace: string; acheteur: Acheteur; retour: string; ip?: string | null }): Promise<string> {
  const cle = process.env.CHARIOW_API_KEY;
  const produit = produitDe(p.formule);
  if (!cle || !produit) throw new Error("Le paiement n'est pas encore ouvert. Réessayez plus tard.");
  type Reponse = { data?: { step?: string; message?: string; payment?: { checkout_url?: string | null } }; message?: string; errors?: Record<string, string[]> };
  const base = {
    product_id: produit,
    email: p.acheteur.email,
    first_name: p.acheteur.prenom,
    last_name: p.acheteur.nom,
    phone: { number: p.acheteur.telephone, country_code: p.acheteur.pays },
    redirect_url: p.retour,
    custom_metadata: { espace: p.espace, formule: p.formule },
  };
  const appel = async (corps: object) => {
    const r = await fetch(`${API}/checkout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json", Accept: "application/json", "Accept-Language": "fr" },
      body: JSON.stringify(corps),
    });
    return { r, d: (await r.json().catch(() => ({}))) as Reponse };
  };
  // 1er essai complet ; si Chariow refuse (400), 2e essai avec le strict minimum (sans devise ni IP).
  let { r, d } = await appel({ ...base, payment_currency: "XOF", ...(p.ip ? { customer_ip: p.ip } : {}) });
  if (r.status === 400) {
    console.error("chariow checkout (1)", r.status, JSON.stringify({ message: d?.message, errors: d?.errors }));
    ({ r, d } = await appel(base));
  }
  if (!r.ok) {
    console.error("chariow checkout", r.status, JSON.stringify({ message: d?.message, errors: d?.errors, step: d?.data?.step }));
    const champ = d?.errors && !Array.isArray(d.errors) ? Object.keys(d.errors)[0] : "";
    if (champ === "email") throw new Error("Adresse e-mail invalide.");
    if (champ?.startsWith("phone")) throw new Error("Ce numéro n'est pas accepté. Vérifiez-le (8 chiffres, sans indicatif).");
    if (champ === "first_name" || champ === "last_name") throw new Error("Votre nom est incomplet : complétez-le dans Compte.");
    if (r.status === 401 || r.status === 403) throw new Error("Le paiement est momentanément indisponible. Contactez-nous.");
    throw new Error(d?.message && !/something went wrong/i.test(d.message) ? `Chariow : ${d.message}` : "Le paiement n'a pas pu s'ouvrir. Réessayez dans un instant.");
  }
  if (d.data?.step === "already_purchased") throw new Error("Chariow indique que ce produit est déjà acheté. Contactez-nous.");
  const url = d.data?.payment?.checkout_url;
  if (!url) throw new Error(d.data?.message || "Chariow n'a pas renvoyé de page de paiement.");
  return url;
}

// Vérifie la signature d'un avis Chariow (HMAC-SHA256 du corps brut avec le secret du Pulse).
export function pulseValide(corps: Buffer, signature: string | null): boolean {
  const secret = process.env.CHARIOW_PULSE_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const attendu = Buffer.from(`sha256=${createHmac("sha256", secret).update(corps).digest("hex")}`);
  const recu = Buffer.from(signature);
  return recu.length === attendu.length && timingSafeEqual(recu, attendu);
}
