"use client";
// Connexions : le client relie ses comptes (Facebook et Instagram, alertes Telegram, site WordPress…).
// Chaque bouton ouvre la page officielle du réseau ; Ovyo ne voit jamais les mots de passe.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Etat = {
  facebook: { nom: string; photo: string | null } | null; facebookEnAttente: boolean;
  instagram: { nom: string } | null; wordpress: { nom: string } | null; telegram: { nom: string } | null;
  ouverts: { facebook: boolean; telegram: boolean };
};
type PageChoix = { id: string; nom: string; photo: string | null; instagram: string | null };

export default function Page() {
  return <Suspense fallback={null}><Connexions /></Suspense>;
}

function Connexions() {
  const q = useSearchParams();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [pages, setPages] = useState<PageChoix[] | null>(null);
  const [wp, setWp] = useState(false);
  const [info, setInfo] = useState(q.get("ok") === "facebook" ? "Votre Page Facebook est reliée." : "");
  const [erreur, setErreur] = useState(q.get("erreur") ?? "");
  const [busy, setBusy] = useState("");

  const charger = () => fetch("/api/connexions/etat").then((r) => r.json()).then(setEtat).catch(() => setErreur("Chargement impossible."));
  useEffect(() => { void charger(); }, []);
  useEffect(() => {
    if (q.get("choix") === "facebook") fetch("/api/connexions/facebook/choix").then((r) => r.json()).then((d) => setPages(d.pages ?? [])).catch(() => {});
  }, [q]);

  async function choisir(id: string) {
    setBusy(id);
    const r = await fetch("/api/connexions/facebook/choix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setBusy(""); setPages(null);
    if (r.ok) { setInfo("Votre Page Facebook est reliée."); void charger(); } else setErreur((await r.json().catch(() => ({}))).error ?? "Erreur.");
  }
  async function retirer(canal: string) {
    if (!window.confirm("Déconnecter ce compte ? Ovyo ne pourra plus y publier.")) return;
    setBusy(canal);
    await fetch("/api/connexions/retirer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ canal }) });
    setBusy(""); void charger();
  }
  async function telegram() {
    setBusy("telegram"); setErreur("");
    const r = await fetch("/api/connexions/telegram");
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setErreur(d.error ?? "Telegram indisponible.");
    window.open(d.lien, "_blank", "noopener");
    setInfo("Telegram s'est ouvert : appuyez sur « Démarrer ». Revenez ensuite ici et rechargez la page.");
  }

  return (
    <div className="tv-page">
      <div className="tv-corps" style={{ paddingTop: 20, maxWidth: 880 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          <Link href="/compte" className="tv-gris" style={{ textDecoration: "none", fontWeight: 600 }}>← Compte</Link>
          <h1 className="tv-titre">Vos comptes reliés</h1>
          <span style={{ fontSize: 15, color: "#33425C" }}>Ovyo publie sur vos comptes et vous prévient. Vous pouvez tout déconnecter à tout moment.</span>
        </div>
        {info ? <p className="notice vert" role="status">{info}</p> : null}
        {erreur ? <p className="notice rouge" role="alert">{erreur}</p> : null}

        {pages?.length ? (
          <section className="cnx-carte" aria-labelledby="t-choix" style={{ borderColor: "#2563EB" }}>
            <h2 id="t-choix" style={{ margin: 0, fontSize: 18 }}>Quelle Page Ovyo doit-il gérer ?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pages.map((p) => (
                <button key={p.id} type="button" className="cnx-page" onClick={() => choisir(p.id)} disabled={busy !== ""}>
                  {p.photo ? <img src={p.photo} alt="" width={40} height={40} style={{ borderRadius: 20 }} /> : <span className="cnx-ico" style={{ background: "#1877F2" }}>f</span>}
                  <span style={{ flex: 1, textAlign: "left" }}><strong>{p.nom}</strong>{p.instagram ? <small> · Instagram @{p.instagram}</small> : null}</span>
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>{busy === p.id ? "…" : "Choisir"}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="cnx-liste">
          <Carte ico="f" couleur="#1877F2" nom="Facebook" role="Publier vos posts, et laisser VOA répondre aux commentaires"
            relie={etat?.facebook ? etat.facebook.nom : null} photo={etat?.facebook?.photo}
            action={etat?.facebook
              ? <button type="button" className="btn small" onClick={() => retirer("facebook")} disabled={busy !== ""}>Déconnecter</button>
              : etat && !etat.ouverts.facebook ? <span className="cnx-bientot">Ouverture prochaine</span>
              : <a className="btn primary small" href="/api/connexions/facebook">Connecter Facebook</a>}
            aide={!etat?.facebook ? "Facebook vous demande de choisir votre Page et d'autoriser Ovyo. Vous devez être administrateur de la Page." : undefined} />
          <Carte ico="ig" couleur="#E1306C" nom="Instagram" role="Le compte professionnel relié à votre Page Facebook"
            relie={etat?.instagram?.nom ?? null}
            action={<span className="cnx-bientot">{etat?.instagram ? "Publication bientôt" : "Se relie avec Facebook"}</span>}
            aide={etat?.facebook && !etat.instagram ? "Aucun compte Instagram professionnel n'est relié à cette Page. Reliez-le dans les paramètres de la Page Facebook, puis reconnectez Facebook." : undefined} />
          <Carte ico="tg" couleur="#229ED9" nom="Alertes Telegram" role="Brief du soir, posts à valider, problèmes : directement sur votre téléphone"
            relie={etat?.telegram?.nom ?? null}
            action={etat?.telegram
              ? <button type="button" className="btn small" onClick={() => retirer("telegram")} disabled={busy !== ""}>Déconnecter</button>
              : etat && !etat.ouverts.telegram ? <span className="cnx-bientot">Ouverture prochaine</span>
              : <button type="button" className="btn primary small" onClick={telegram} disabled={busy !== ""}>{busy === "telegram" ? "…" : "Recevoir mes alertes"}</button>} />
          <Carte ico="W" couleur="#21759B" nom="Site WordPress" role="Publier vos articles sur votre site"
            relie={etat?.wordpress?.nom ?? null}
            action={etat?.wordpress
              ? <button type="button" className="btn small" onClick={() => retirer("wordpress")} disabled={busy !== ""}>Déconnecter</button>
              : <button type="button" className="btn primary small" onClick={() => setWp(!wp)}>{wp ? "Fermer" : "Relier mon site"}</button>}>
            {wp && !etat?.wordpress ? <FormWordPress fini={() => { setWp(false); setInfo("Votre site est relié."); void charger(); }} /> : null}
          </Carte>
          <Carte ico="in" couleur="#0A66C2" nom="LinkedIn" role="Publier sur votre profil ou votre page entreprise" relie={null} action={<span className="cnx-bientot">Bientôt</span>} />
          <Carte ico="tt" couleur="#111111" nom="TikTok" role="Publier vos vidéos" relie={null} action={<span className="cnx-bientot">Bientôt</span>} />
        </div>
      </div>
    </div>
  );
}

function Carte({ ico, couleur, nom, role, relie, photo, action, aide, children }: { ico: string; couleur: string; nom: string; role: string; relie: string | null; photo?: string | null; action: React.ReactNode; aide?: string; children?: React.ReactNode }) {
  return (
    <section className="cnx-carte" aria-label={nom}>
      <div className="cnx-ligne">
        {photo ? <img src={photo} alt="" width={48} height={48} style={{ borderRadius: 14 }} /> : <span className="cnx-ico" style={{ background: couleur }}>{ico}</span>}
        <span style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <strong style={{ fontSize: 16 }}>{nom}</strong>
          <span style={{ fontSize: 13, color: "#4B5563" }}>{role}</span>
          <span className={relie ? "cnx-etat ok" : "cnx-etat"}>{relie ? `Relié · ${relie}` : "Non relié"}</span>
        </span>
        {action}
      </div>
      {aide ? <p style={{ margin: 0, fontSize: 13, color: "#4B5563" }}>{aide}</p> : null}
      {children}
    </section>
  );
}

function FormWordPress({ fini }: { fini: () => void }) {
  const [f, setF] = useState({ url: "", user: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function envoyer(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/connexions/wordpress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Connexion impossible.");
    fini();
  }
  return (
    <form onSubmit={envoyer} style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, borderTop: "1px solid #EEF1F5" }}>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#33425C", lineHeight: 1.6 }}>
        <li>Dans votre WordPress : <strong>Comptes › Profil</strong> (ou Utilisateurs › Profil).</li>
        <li>Tout en bas, « Mots de passe d&apos;application » : tapez « Ovyo », puis <strong>Ajouter</strong>.</li>
        <li>Copiez le mot de passe affiché et collez-le ci-dessous.</li>
      </ol>
      <label className="field">Adresse du site<input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="www.monsite.com" /></label>
      <label className="field">Identifiant WordPress<input value={f.user} onChange={(e) => setF({ ...f, user: e.target.value })} autoComplete="off" /></label>
      <label className="field">Mot de passe d&apos;application<input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="off" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" /></label>
      {err ? <p className="notice rouge" role="alert">{err}</p> : null}
      <button type="submit" className="btn primary" disabled={busy} style={{ alignSelf: "flex-start" }}>{busy ? "Vérification…" : "Relier mon site"}</button>
    </form>
  );
}
