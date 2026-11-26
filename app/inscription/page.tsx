"use client";
// Inscription : crée l'espace client (7 jours d'essai, 15 publications) et son compte administrateur.
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AuthCadre } from "@/components/AuthCadre";

const TYPES = [
  { id: "media", nom: "Média" },
  { id: "entreprise", nom: "Entreprise" },
  { id: "agence", nom: "Agence" },
  { id: "institution", nom: "Institution / ONG" },
];

export default function Inscription() {
  const [f, setF] = useState({ organisation: "", type: "media", nom: "", contact: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/inscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error || `Inscription impossible (${res.status}).`);
      window.location.href = "/?bienvenue=1";
    } catch (err) {
      setError((err as Error).message); setBusy(false);
    }
  }

  return (
    <AuthCadre titre="Créez votre espace" sousTitre="7 jours gratuits et 15 publications offertes. Prêt en une minute."
      bas={<>Déjà inscrit ? <a href="/acces">Se connecter</a></>}>
      <form onSubmit={submit} className="ova-form" noValidate>
        <label>Nom de votre organisation
          <input value={f.organisation} onChange={maj("organisation")} placeholder="Ex. : Radio Horizon, Agence Sira…" autoComplete="organization" />
        </label>
        <fieldset className="ova-types">
          <legend>Vous êtes</legend>
          {TYPES.map((t) => (
            <button type="button" key={t.id} aria-pressed={f.type === t.id} onClick={() => setF({ ...f, type: t.id })}>{t.nom}</button>
          ))}
        </fieldset>
        <label>Votre nom
          <input value={f.nom} onChange={maj("nom")} placeholder="Prénom et nom" autoComplete="name" />
        </label>
        <label>E-mail ou téléphone
          <input value={f.contact} onChange={maj("contact")} placeholder="vous@exemple.com" autoComplete="username" />
        </label>
        <label>Mot de passe
          <span className="ova-pass">
            <input type={show ? "text" : "password"} value={f.password} onChange={maj("password")} placeholder="10 caractères, lettres et chiffres" autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show}><Icon name={show ? "oeilBarre" : "oeil"} size={20} /></button>
          </span>
        </label>
        {error ? <p className="ova-err" role="alert">{error}</p> : null}
        <button type="submit" className="ova-go" disabled={busy}>{busy ? "Création de votre espace…" : "Démarrer l'essai gratuit"}</button>
      </form>
    </AuthCadre>
  );
}
