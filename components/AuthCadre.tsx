// Cadre commun des écrans de connexion et d'inscription Ovyo.
import { OvyoLogo, OvyoSymbole } from "./OvyoLogo";

const ATOUTS = [
  ["Veille automatique", "Ovyo repère les actus de votre secteur, chaque jour."],
  ["Publication multi-réseaux", "Facebook, LinkedIn, TikTok, site web : un texte adapté à chacun."],
  ["Communauté gérée", "Les commentaires reçoivent une réponse, dans votre ton."],
];

export function AuthCadre({ titre, sousTitre, children, bas }: { titre: string; sousTitre: string; children: React.ReactNode; bas?: React.ReactNode }) {
  return (
    <div className="ova">
      <aside className="ova-pub" aria-hidden="true">
        <span className="ova-pub-logo"><OvyoSymbole taille={44} fond="#fff" point="#FF6A1A" /><b>ovyo</b></span>
        <h2>Votre média tourne<br />tout seul.</h2>
        <ul>
          {ATOUTS.map(([t, d]) => <li key={t}><i /><span><strong>{t}</strong>{d}</span></li>)}
        </ul>
        <small>Essai gratuit de 14 jours · sans carte bancaire · paiement Mobile Money</small>
      </aside>
      <main className="ova-main">
        <div className="ova-carte">
          <span className="ova-logo-mobile"><OvyoLogo taille={34} /></span>
          <h1>{titre}</h1>
          <p className="ova-sous">{sousTitre}</p>
          {children}
        </div>
        {bas ? <div className="ova-bas">{bas}</div> : null}
        <p className="ova-legal">En continuant, vous acceptez les <a href="/cgu">conditions d&apos;utilisation</a> et la <a href="/confidentialite">politique de confidentialité</a>.</p>
      </main>
    </div>
  );
}
