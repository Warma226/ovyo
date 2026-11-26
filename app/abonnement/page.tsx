"use client";
// Abonnement : formule en cours, choix d'une formule et paiement Mobile Money / carte via Chariow.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FORMULES, formuleDe, prixTexte, type FormuleId } from "@/lib/formules";

type Etat = {
  statut: "essai" | "actif" | "suspendu" | "resilie"; formule: string; ouvert: boolean;
  essai_fin: string | null; abonnement_fin: string | null; paiement: boolean; disponibles: FormuleId[];
  acheteur: { nom: string; contact: string };
  paiements: { formule: string; montant: number | null; devise: string | null; fin: string | null; created_at: string }[];
};

const PAYS: [string, string][] = [
  ["BF", "Burkina Faso"], ["CI", "Côte d'Ivoire"], ["SN", "Sénégal"], ["ML", "Mali"], ["BJ", "Bénin"], ["TG", "Togo"],
  ["NE", "Niger"], ["GN", "Guinée"], ["CM", "Cameroun"], ["GA", "Gabon"], ["CG", "Congo"], ["CD", "RD Congo"], ["FR", "France"],
];
const jour = (s: string | null) => (s ? new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");
const reste = (s: string | null) => (s ? Math.ceil((new Date(s).getTime() - Date.now()) / 864e5) : 0);

export default function Page() {
  return <Suspense fallback={null}><Abonnement /></Suspense>;
}

function Abonnement() {
  const q = useSearchParams();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [choix, setChoix] = useState<FormuleId | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/abonnement", { cache: "no-store" }).then((r) => r.json()).then((d) => (d.error ? setErreur(d.error) : setEtat(d))).catch(() => setErreur("Chargement impossible."));
  }, []);

  const f = formuleDe(etat?.formule);
  const fin = etat?.statut === "actif" ? etat.abonnement_fin : etat?.essai_fin ?? null;
  const jours = reste(fin);

  return (
    <div className="tv-page">
      <div className="tv-corps" style={{ paddingTop: 20, maxWidth: 980 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          <Link href="/compte" className="tv-gris" style={{ textDecoration: "none", fontWeight: 600 }}>← Compte</Link>
          <h1 className="tv-titre">Abonnement</h1>
          <span style={{ fontSize: 15, color: "#33425C" }}>Payez par Orange Money, Moov Money, Wave ou carte bancaire. Sans engagement : vous payez pour 30 jours à la fois.</span>
        </div>

        {q.get("retour") ? <p className="notice vert" role="status">Merci ! Dès que Chariow confirme le paiement (en général moins d&apos;une minute), votre abonnement s&apos;active. Rechargez la page si besoin.</p> : null}
        {erreur ? <p className="notice rouge" role="alert">{erreur}</p> : null}

        {etat ? (
          <section className="tv-carte" aria-label="Votre situation" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 20, borderColor: etat.ouvert ? undefined : "#E94A06" }}>
            <span style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="tv-kicker">{etat.statut === "actif" ? `FORMULE ${f?.nom.toUpperCase() ?? ""}` : "ESSAI GRATUIT"}</span>
              <strong style={{ fontSize: 20 }}>
                {etat.ouvert
                  ? `${etat.statut === "actif" ? "Actif" : "Essai en cours"} · ${jours} jour${jours > 1 ? "s" : ""} restant${jours > 1 ? "s" : ""}`
                  : etat.statut === "actif" ? "Abonnement expiré" : "Essai terminé"}
              </strong>
              <span className="tv-gris" style={{ fontSize: 14 }}>
                {etat.ouvert
                  ? `${etat.statut === "actif" ? "Renouvellement à prévoir le" : "Fin de l'essai le"} ${jour(fin)}.${etat.statut === "actif" ? " Payer avant ajoute 30 jours à la date de fin." : ""}`
                  : "Les publications automatiques sont arrêtées. Vos contenus restent accessibles. Choisissez une formule pour reprendre."}
              </span>
            </span>
          </section>
        ) : null}

        {etat && !etat.paiement ? <p className="notice" role="status">Le paiement en ligne ouvre très bientôt.</p> : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}>
          {FORMULES.map((x) => {
            const dispo = Boolean(etat?.paiement && etat.disponibles.includes(x.id) && !x.bientot);
            const actuelle = etat?.statut === "actif" && etat.formule === x.id;
            return (
              <section key={x.id} className="tv-carte" aria-labelledby={`f-${x.id}`} style={{ flex: "1 1 260px", gap: 12, borderColor: x.id === "pro" ? "#2563EB" : undefined, borderWidth: x.id === "pro" ? 2 : undefined }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 id={`f-${x.id}`} className="tv-h2" style={{ flex: 1, margin: 0 }}>{x.nom}</h2>
                  {x.id === "pro" ? <span className="tv-pill" style={{ background: "#2563EB", color: "#fff" }}>CONSEILLÉ</span> : null}
                  {actuelle ? <span className="tv-pill" style={{ background: "#D9F7E6", color: "#05603A" }}>VOTRE FORMULE</span> : null}
                </span>
                <span style={{ fontSize: 13, color: "#4B5563" }}>{x.pour}</span>
                <span><strong style={{ fontSize: 30, fontFamily: "var(--font-mont)" }}>{prixTexte(x.prix)}</strong> <span className="tv-gris">/ mois</span></span>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "#33425C", flex: 1 }}>
                  {x.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                {x.bientot
                  ? <span className="cnx-bientot" style={{ alignSelf: "flex-start" }}>Bientôt disponible</span>
                  : <button type="button" className={`btn ${x.id === "pro" ? "primary" : ""}`} disabled={!dispo} onClick={() => setChoix(x.id)}>{actuelle ? "Renouveler 30 jours" : `Choisir ${x.nom}`}</button>}
              </section>
            );
          })}
        </div>

        {choix && etat ? <FormPaiement formule={choix} etat={etat} fermer={() => setChoix(null)} /> : null}

        {etat?.paiements.length ? (
          <section className="tv-carte" aria-labelledby="t-hist" style={{ marginTop: 20, gap: 6 }}>
            <h2 id="t-hist" className="tv-h2">Mes paiements</h2>
            {etat.paiements.map((p, i) => (
              <span key={i} style={{ fontSize: 14, color: "#33425C" }}>{jour(p.created_at)} · {formuleDe(p.formule)?.nom ?? p.formule} · {p.montant ? `${p.montant.toLocaleString("fr-FR")} ${p.devise === "XOF" ? "F" : p.devise ?? ""}` : ""}{p.fin ? ` · jusqu'au ${jour(p.fin)}` : ""}</span>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function FormPaiement({ formule, etat, fermer }: { formule: FormuleId; etat: Etat; fermer: () => void }) {
  const x = formuleDe(formule)!;
  const [prenom, ...reste] = etat.acheteur.nom.trim().split(/\s+/);
  const contact = etat.acheteur.contact;
  const [v, setV] = useState({
    prenom: prenom ?? "", nom: reste.join(" "), email: contact.includes("@") ? contact : "",
    telephone: contact.includes("@") ? "" : contact.replace(/\D/g, "").replace(/^(00)?226/, ""), pays: "BF",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const maj = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  async function payer(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/abonnement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formule, ...v }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok || !d.url) { setBusy(false); return setErr(d.error || "Paiement indisponible. Réessayez."); }
    window.location.href = d.url;
  }

  return (
    <form className="tv-carte" onSubmit={payer} aria-labelledby="t-payer" style={{ marginTop: 20, gap: 14, border: "2px solid #2563EB" }}>
      <div className="row" style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 id="t-payer" className="tv-h2" style={{ flex: 1, margin: 0 }}>Payer {x.nom} · {prixTexte(x.prix)}</h2>
        <button type="button" className="btn small" onClick={fermer}>Annuler</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <label className="field" style={{ flex: "1 1 200px" }}>Prénom<input value={v.prenom} onChange={maj("prenom")} autoComplete="given-name" required /></label>
        <label className="field" style={{ flex: "1 1 200px" }}>Nom<input value={v.nom} onChange={maj("nom")} autoComplete="family-name" required /></label>
      </div>
      <label className="field">E-mail (pour le reçu)<input type="email" value={v.email} onChange={maj("email")} autoComplete="email" required /></label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <label className="field" style={{ flex: "1 1 180px" }}>Pays<select value={v.pays} onChange={maj("pays")}>{PAYS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
        <label className="field" style={{ flex: "2 1 220px" }}>Numéro qui va payer<input inputMode="tel" value={v.telephone} onChange={maj("telephone")} placeholder="70 00 00 00" autoComplete="tel-national" required /></label>
      </div>
      {err ? <p className="notice rouge" role="alert">{err}</p> : null}
      <button type="submit" className="btn primary" disabled={busy} style={{ height: 50, fontSize: 16 }}>{busy ? "Ouverture du paiement…" : `Payer ${prixTexte(x.prix)}`}</button>
      <span className="tv-gris" style={{ fontSize: 13 }}>Vous passez sur la page sécurisée de Chariow, puis revenez ici automatiquement.</span>
    </form>
  );
}
