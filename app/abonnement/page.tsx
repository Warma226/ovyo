"use client";
// Abonnement : choisir une formule, saisir le numéro qui paie, et c'est parti (paiement Mobile Money ou carte via Chariow).
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FORMULES, formuleDe, prixTexte, type FormuleId } from "@/lib/formules";

type Etat = {
  statut: "essai" | "actif" | "suspendu" | "resilie"; formule: string; ouvert: boolean;
  essai_fin: string | null; abonnement_fin: string | null; paiement: boolean; disponibles: FormuleId[];
  acheteur: { nom: string; contact: string };
  paiements: { formule: string; montant: number | null; devise: string | null; fin: string | null; created_at: string }[];
};

const PAYS: [string, string, string][] = [
  ["BF", "+226", "Burkina Faso"], ["CI", "+225", "Côte d'Ivoire"], ["SN", "+221", "Sénégal"], ["ML", "+223", "Mali"], ["BJ", "+229", "Bénin"],
  ["TG", "+228", "Togo"], ["NE", "+227", "Niger"], ["GN", "+224", "Guinée"], ["CM", "+237", "Cameroun"], ["FR", "+33", "France"],
];
const jour = (s: string | null) => (s ? new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "");
const reste = (s: string | null) => (s ? Math.ceil((new Date(s).getTime() - Date.now()) / 864e5) : 0);

export default function Page() {
  return <Suspense fallback={null}><Abonnement /></Suspense>;
}

function Abonnement() {
  const q = useSearchParams();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [choix, setChoix] = useState<FormuleId>("pro");
  const [pays, setPays] = useState("BF");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/abonnement", { cache: "no-store" }).then((r) => r.json()).then((d: Etat & { error?: string }) => {
      if (d.error) return setErreur(d.error);
      setEtat(d);
      const c = d.acheteur.contact || "";
      if (c.includes("@")) setEmail(c); else setTel(c.replace(/\D/g, "").replace(/^(00)?226/, ""));
      if (d.statut === "actif" && (d.formule === "essentiel" || d.formule === "pro")) setChoix(d.formule);
    }).catch(() => setErreur("Chargement impossible."));
  }, []);

  const f = formuleDe(choix)!;
  const fin = etat?.statut === "actif" ? etat.abonnement_fin : etat?.essai_fin ?? null;
  const jours = reste(fin);
  const emailConnu = Boolean(etat?.acheteur.contact.includes("@"));
  const offertes = FORMULES.filter((x) => !x.bientot);

  async function payer(e: React.FormEvent) {
    e.preventDefault();
    if (!etat) return;
    setBusy(true); setErreur("");
    const [prenom, ...autres] = (etat.acheteur.nom || "").trim().split(/\s+/);
    const r = await fetch("/api/abonnement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formule: choix, prenom: prenom || "Client", nom: autres.join(" ") || prenom || "Ovyo", email, telephone: tel, pays }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok || !d.url) { setBusy(false); return setErreur(d.error || "Le paiement n'a pas pu s'ouvrir. Réessayez."); }
    window.location.href = d.url;
  }

  return (
    <div className="tv-page">
      <div className="tv-corps ab-page">
        <h1 className="tv-titre">Abonnement</h1>
        {etat ? (
          <p className="ab-statut">
            {etat.ouvert
              ? <>{etat.statut === "actif" ? `Formule ${formuleDe(etat.formule)?.nom ?? ""}` : "Essai gratuit"} · <strong>{jours} jour{jours > 1 ? "s" : ""}</strong> restant{jours > 1 ? "s" : ""} (jusqu&apos;au {jour(fin)})</>
              : <><strong>{etat.statut === "actif" ? "Abonnement expiré." : "Essai terminé."}</strong> Vos publications automatiques sont en pause.</>}
          </p>
        ) : null}
        {q.get("retour") ? <p className="notice vert" role="status">Merci ! Votre abonnement s&apos;active dès que le paiement est confirmé, en général en moins d&apos;une minute.</p> : null}

        <form onSubmit={payer} className="ab-carte">
          <fieldset className="ab-choix">
            <legend className="sr-only">Formule</legend>
            {offertes.map((x) => (
              <label key={x.id} className={`ab-option${choix === x.id ? " ab-on" : ""}`}>
                <input type="radio" name="formule" value={x.id} checked={choix === x.id} onChange={() => setChoix(x.id)} />
                <span className="ab-option-h"><strong>{x.nom}</strong><span>{x.postsParMois} posts / mois</span></span>
                <span className="ab-prix">{prixTexte(x.prix)}<small> / mois</small></span>
              </label>
            ))}
          </fieldset>

          <ul className="ab-points">{f.points.map((p) => <li key={p}>{p}</li>)}</ul>

          <div className="ab-champ">
            <label htmlFor="tel">Numéro Mobile Money</label>
            <div className="ab-tel">
              <select aria-label="Pays" value={pays} onChange={(e) => setPays(e.target.value)}>
                {PAYS.map(([c, ind, n]) => <option key={c} value={c}>{ind} {n}</option>)}
              </select>
              <input id="tel" inputMode="tel" autoComplete="tel-national" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="70 00 00 00" required />
            </div>
          </div>
          {!emailConnu ? (
            <div className="ab-champ">
              <label htmlFor="mail">E-mail pour le reçu</label>
              <input id="mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          ) : null}

          {erreur ? <p className="notice rouge" role="alert" style={{ margin: 0 }}>{erreur}</p> : null}
          <button type="submit" className="ab-payer" disabled={busy || !etat || !etat.paiement}>
            {busy ? "Ouverture du paiement…" : `Payer ${prixTexte(f.prix)}`}
          </button>
          <span className="ab-note">Orange Money · Moov Money · Wave · Carte · 30 jours, sans engagement{emailConnu ? ` · Reçu envoyé à ${email}` : ""}</span>
        </form>

        {etat?.paiements.length ? (
          <details className="ab-histo">
            <summary>Mes paiements ({etat.paiements.length})</summary>
            {etat.paiements.map((p, i) => (
              <div key={i}><span>{jour(p.created_at)} · {formuleDe(p.formule)?.nom ?? p.formule}</span><strong>{p.montant ? `${Number(p.montant).toLocaleString("fr-FR")} F` : ""}</strong></div>
            ))}
          </details>
        ) : null}
      </div>
    </div>
  );
}
