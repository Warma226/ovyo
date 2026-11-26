"use client";
// Invitation d'un membre : il choisit son mot de passe, puis entre directement dans l'espace de son organisation.
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCadre } from "@/components/AuthCadre";
import { DROITS, ZONE_NOM, type Role, type Zone } from "@/lib/roles";

type Invit = { nom: string; contact: string; role: Role; roleNom: string; expire: string; espace: string };

export default function InvitationPage() {
  return <Suspense fallback={null}><Invitation /></Suspense>;
}

function force(m: string): number {
  let n = 0;
  if (m.length >= 10) n++;
  if (m.length >= 14) n++;
  if (/[a-zA-Z]/.test(m) && /\d/.test(m)) n++;
  if (/[^a-zA-Z0-9]/.test(m) || (/[a-z]/.test(m) && /[A-Z]/.test(m))) n++;
  return n;
}

function Invitation() {
  const t = useSearchParams().get("t") ?? "";
  const [inv, setInv] = useState<Invit | null>(null);
  const [erreurLien, setErreurLien] = useState("");
  const [mdp, setMdp] = useState("");
  const [mdp2, setMdp2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/invitation?t=${encodeURIComponent(t)}`).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setErreurLien(d.error || "Lien invalide."); else setInv(d as Invit);
    }).catch(() => setErreurLien("Connexion impossible. Réessayez."));
  }, [t]);
  const f = force(mdp);
  async function valider(e: React.FormEvent) {
    e.preventDefault();
    if (mdp !== mdp2) return setError("Les deux mots de passe ne sont pas identiques.");
    setBusy(true); setError("");
    const r = await fetch("/api/invitation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t, password: mdp }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setError(d.error || "Impossible d'activer le compte."); setBusy(false); return; }
    window.location.href = "/";
  }

  if (!inv) {
    return (
      <AuthCadre titre={erreurLien ? "Ce lien ne fonctionne plus" : "Un instant…"} sousTitre={erreurLien || "Vérification de votre invitation."}
        bas={<>Vous avez déjà un compte ? <a href="/acces">Se connecter</a></>}>{null}</AuthCadre>
    );
  }
  const prenom = inv.nom.split(/\s+/)[0] ?? "";
  const zones = (Object.keys(DROITS[inv.role]) as Zone[]).filter((z) => DROITS[inv.role][z] !== "-");
  return (
    <AuthCadre titre={`Bienvenue, ${prenom}`}
      sousTitre={`${inv.espace || "Votre organisation"} vous invite sur Ovyo comme ${inv.roleNom.toLowerCase()}. Invitation valable jusqu'au ${new Date(inv.expire).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.`}>
      <form className="ova-form" onSubmit={valider} noValidate>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {zones.map((z) => <span key={z} style={{ padding: "4px 10px", borderRadius: 999, background: "#EFF4FF", color: "#1D4ED8", fontSize: 12, fontWeight: 700 }}>{ZONE_NOM[z]}{DROITS[inv.role][z] === "l" ? " (lecture)" : ""}</span>)}
        </div>
        <label>Choisissez un mot de passe
          <input type="password" autoComplete="new-password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="10 caractères, lettres et chiffres" />
        </label>
        <div style={{ display: "flex", gap: 4, marginTop: -6 }}>{[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < f ? (f >= 3 ? "#16A34A" : "#F59E0B") : "#E5E7EB" }} />)}</div>
        <label>Confirmez-le
          <input type="password" autoComplete="new-password" value={mdp2} onChange={(e) => setMdp2(e.target.value)} />
        </label>
        {error ? <p className="ova-err" role="alert">{error}</p> : null}
        <button type="submit" className="ova-go" disabled={busy}>{busy ? "Activation…" : "Rejoindre l'équipe"}</button>
        <p className="ova-note">Ce lien ne sert qu&apos;une fois. Ensuite, connectez-vous avec {inv.contact} et ce mot de passe.</p>
      </form>
    </AuthCadre>
  );
}
