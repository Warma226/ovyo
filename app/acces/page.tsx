"use client";
// Écran de connexion Ovyo : e-mail (ou téléphone) + mot de passe. Le compte désigne aussi l'espace client.
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { AuthCadre } from "@/components/AuthCadre";
import { safeNext } from "@/lib/session";

export default function AccesPage() {
  return <Suspense fallback={null}><Acces /></Suspense>;
}

function Acces() {
  const q = useSearchParams();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return setError("Entrez votre e-mail ou votre téléphone.");
    if (!password) return setError("Entrez votre mot de passe.");
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contact, password }) });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error || `Connexion impossible (${res.status}).`);
      window.location.href = safeNext(q.get("next"));
    } catch (err) {
      setError((err as Error).message); setBusy(false);
    }
  }

  return (
    <AuthCadre titre="Bon retour" sousTitre="Connectez-vous à votre espace Ovyo."
      bas={<>Pas encore de compte ? <a href="/inscription">Créer mon espace gratuitement</a></>}>
      <form onSubmit={submit} className="ova-form" noValidate>
        <label>E-mail ou téléphone
          <input name="username" type="text" autoComplete="username" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="vous@exemple.com" />
        </label>
        <label>Mot de passe
          <span className="ova-pass">
            <input name="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" aria-invalid={Boolean(error)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show}><Icon name={show ? "oeilBarre" : "oeil"} size={20} /></button>
          </span>
        </label>
        {error ? <p className="ova-err" role="alert">{error}</p> : null}
        <button type="submit" className="ova-go" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
        <p className="ova-note">Vous restez connecté 30 jours sur cet appareil. Mot de passe oublié ? Demandez un nouveau lien à l&apos;administrateur de votre espace.</p>
      </form>
    </AuthCadre>
  );
}
