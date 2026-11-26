// Politique de confidentialité d'Ovyo (page publique, demandée aussi par TikTok et Meta).
export const metadata = { title: "Politique de confidentialité · Ovyo" };

export default function Confidentialite() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px", lineHeight: 1.65, fontSize: 16 }}>
      <h1 style={{ fontSize: 28 }}>Politique de confidentialité d&apos;Ovyo</h1>
      <p style={{ color: "#667" }}>Dernière mise à jour : 26 novembre 2026</p>

      <h2>1. Qui sommes-nous</h2>
      <p>Ovyo est édité par Warmachiner Tech, Ouagadougou, Burkina Faso. Ovyo publie les contenus de ses clients sur leurs propres comptes (site web, Facebook, LinkedIn, TikTok) et les aide à répondre à leur communauté.</p>

      <h2>2. Données traitées</h2>
      <ul>
        <li><strong>Compte</strong> : nom, e-mail ou téléphone, mot de passe chiffré, rôle dans l&apos;équipe, appareils connectés.</li>
        <li><strong>Espace client</strong> : nom de l&apos;organisation, logo, réglages éditoriaux, sources suivies.</li>
        <li><strong>Comptes reliés</strong> : lorsqu&apos;un client relie un compte (par exemple TikTok), Ovyo conserve les jetons d&apos;accès fournis par la plateforme, l&apos;identifiant du compte et son nom d&apos;affichage.</li>
        <li><strong>Contenus</strong> : textes, visuels et photos préparés pour publication, et commentaires publics reçus sur les Pages reliées, pour y répondre.</li>
      </ul>
      <p>Ovyo n&apos;affiche pas de publicité et ne vend aucune donnée.</p>

      <h2>3. Conservation et sécurité</h2>
      <p>Les données sont stockées dans une base protégée ; les jetons d&apos;accès restent côté serveur et ne s&apos;affichent jamais dans le navigateur. Chaque espace client est isolé des autres. À la fermeture d&apos;un espace, ses données sont supprimées sous 30 jours.</p>

      <h2>4. Vos droits</h2>
      <p>Vous pouvez demander l&apos;accès, la correction ou la suppression de vos données. Le titulaire d&apos;un compte relié peut aussi retirer l&apos;accès d&apos;Ovyo à tout moment depuis les paramètres de la plateforme concernée (par exemple, dans TikTok : Paramètres et confidentialité › Sécurité › Applications autorisées).</p>

      <h2>5. Contact</h2>
      <p>Warmachiner Tech, warmachinertech@gmail.com.</p>

      <p style={{ marginTop: 32 }}><a href="/cgu">Conditions d&apos;utilisation</a></p>
    </main>
  );
}
