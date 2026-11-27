// Conditions générales d'utilisation d'Ovyo (page publique, demandée aussi par Meta et TikTok).
import Link from "next/link";
import { PageLegale, type Article } from "@/components/PageLegale";

export const metadata = { title: "Conditions générales d'utilisation · Ovyo" };

const A: Article[] = [
  {
    id: "objet", titre: "Objet et éditeur",
    contenu: <>
      <p>Les présentes conditions générales d&apos;utilisation (les « Conditions ») encadrent l&apos;accès et l&apos;utilisation du service <strong>Ovyo</strong>, accessible en ligne.</p>
      <p>Ovyo aide les médias, entreprises, agences, institutions et organisations à suivre l&apos;actualité de leur secteur, préparer leurs publications et leurs visuels, les programmer sur leurs propres comptes et répondre à leur communauté.</p>
      <div className="lg-encadre">
        <strong>Éditeur du service</strong>
        <span>Warmachiner Tech, Ouagadougou, Burkina Faso</span>
        <span>Contact : <a href="mailto:warmachinertech@gmail.com">warmachinertech@gmail.com</a></span>
      </div>
    </>,
  },
  {
    id: "definitions", titre: "Définitions",
    contenu: <dl className="lg-defs">
      <dt>Client</dt><dd>L&apos;organisation ou la personne qui ouvre un espace sur Ovyo.</dd>
      <dt>Espace</dt><dd>L&apos;environnement propre à chaque Client : réglages, membres, contenus et comptes reliés. Les espaces sont strictement séparés les uns des autres.</dd>
      <dt>Administrateur</dt><dd>La personne qui ouvre l&apos;espace ou à qui ce rôle est attribué. Elle gère les membres, l&apos;abonnement et les comptes reliés.</dd>
      <dt>Membre</dt><dd>Toute personne invitée dans un espace par un Administrateur.</dd>
      <dt>Formule</dt><dd>L&apos;offre payante choisie par le Client (Essentiel, Pro ou Agence).</dd>
      <dt>Contenus</dt><dd>Les textes, visuels, photos et publications créés, importés ou publiés depuis Ovyo.</dd>
    </dl>,
  },
  {
    id: "acceptation", titre: "Acceptation des Conditions",
    contenu: <p>La création d&apos;un espace ou l&apos;utilisation d&apos;Ovyo vaut acceptation pleine et entière des présentes Conditions et de la <Link href="/confidentialite">Politique de confidentialité</Link>. La personne qui accepte ces Conditions au nom d&apos;une organisation déclare être habilitée à l&apos;engager.</p>,
  },
  {
    id: "compte", titre: "Compte et espace client",
    contenu: <ul>
      <li>Les informations fournies à l&apos;inscription doivent être exactes et tenues à jour.</li>
      <li>Chaque utilisateur est responsable de la confidentialité de son mot de passe et des actions faites depuis son compte.</li>
      <li>L&apos;Administrateur choisit les membres de son espace et leurs droits. Il peut les retirer à tout moment.</li>
      <li>Toute utilisation non autorisée d&apos;un compte doit être signalée sans délai à l&apos;éditeur.</li>
    </ul>,
  },
  {
    id: "essai", titre: "Essai gratuit",
    contenu: <>
      <p>Chaque nouvel espace bénéficie d&apos;un essai gratuit de <strong>7 jours</strong>, limité à <strong>15 publications</strong> programmées ou publiées. L&apos;essai ne demande aucun moyen de paiement.</p>
      <p>À la fin de l&apos;essai, les publications automatiques s&apos;arrêtent. Le Client peut poursuivre en choisissant une Formule.</p>
    </>,
  },
  {
    id: "abonnement", titre: "Formules, prix et paiement",
    contenu: <>
      <table className="lg-table">
        <thead><tr><th scope="col">Formule</th><th scope="col">Prix pour 30 jours</th><th scope="col">Publications incluses</th></tr></thead>
        <tbody>
          <tr><td>Essentiel</td><td>10 000 F CFA</td><td>40</td></tr>
          <tr><td>Pro</td><td>20 000 F CFA</td><td>150</td></tr>
          <tr><td>Agence</td><td>45 000 F CFA</td><td>Illimitées (bientôt disponible)</td></tr>
        </tbody>
      </table>
      <ul>
        <li>Les prix sont indiqués en francs CFA (XOF) sur la page Abonnement. Ils peuvent évoluer ; le prix applicable est celui affiché au moment du paiement.</li>
        <li>Le paiement est réalisé par <strong>Mobile Money</strong> (Orange Money, Moov Money, Wave…) ou par <strong>carte bancaire</strong>, sur la page sécurisée de notre prestataire <strong>Chariow</strong>. Ovyo ne reçoit ni ne conserve aucune donnée de carte ou de compte Mobile Money.</li>
        <li>Chaque paiement ouvre l&apos;accès à la Formule pour <strong>30 jours</strong>. Il n&apos;y a <strong>aucun prélèvement automatique</strong> : le Client renouvelle lui-même, quand il le souhaite.</li>
        <li>Un renouvellement effectué avant la fin de la période en cours s&apos;ajoute à la date de fin prévue.</li>
        <li>Lorsque le nombre de publications inclus est atteint, les publications automatiques s&apos;arrêtent jusqu&apos;au renouvellement ou jusqu&apos;au passage à une Formule supérieure.</li>
        <li>Un reçu est envoyé par Chariow à l&apos;adresse e-mail indiquée lors du paiement.</li>
      </ul>
    </>,
  },
  {
    id: "remboursement", titre: "Absence de remboursement",
    contenu: <>
      <p>Tout paiement est <strong>ferme et définitif</strong> : aucune somme versée n&apos;est remboursée, quel qu&apos;en soit le motif, y compris en cas de non-utilisation du service ou de fermeture de l&apos;espace en cours de période.</p>
      <p>L&apos;essai gratuit de 7 jours permet au Client de tester Ovyo avant tout paiement. Chaque paiement reçu ajoute 30 jours à l&apos;abonnement : un paiement effectué deux fois prolonge donc l&apos;accès d&apos;autant, sans remboursement.</p>
    </>,
  },
  {
    id: "fin", titre: "Fin d'abonnement, suspension et fermeture",
    contenu: <ul>
      <li><strong>Sans renouvellement</strong>, les publications automatiques s&apos;arrêtent à la date de fin. Les Contenus restent accessibles en lecture pendant 30 jours, puis l&apos;espace peut être supprimé.</li>
      <li><strong>Fermeture à l&apos;initiative du Client</strong> : l&apos;Administrateur peut demander à tout moment la fermeture de l&apos;espace et la suppression de ses données par e-mail.</li>
      <li><strong>Suspension par l&apos;éditeur</strong> : un espace peut être suspendu, après avertissement sauf urgence, en cas de manquement grave aux présentes Conditions, d&apos;usage frauduleux ou de non-paiement.</li>
    </ul>,
  },
  {
    id: "reseaux", titre: "Comptes de réseaux sociaux et sites reliés",
    contenu: <>
      <p>Ovyo se connecte uniquement aux comptes que le Client relie lui-même, avec son autorisation explicite, au moyen des interfaces officielles de chaque plateforme (par exemple Graph API de Meta, API de TikTok, API de WordPress). Ovyo ne demande jamais les mots de passe de ces comptes.</p>
      <p>Le Client peut retirer cet accès à tout moment, depuis Ovyo ou depuis la plateforme concernée. Il reste soumis aux conditions de chaque plateforme, dont Ovyo ne maîtrise ni les règles ni la disponibilité.</p>
    </>,
  },
  {
    id: "contenus", titre: "Contenus et responsabilité éditoriale",
    contenu: <>
      <p>Ovyo utilise l&apos;intelligence artificielle pour proposer des textes, des visuels et des réponses. Ces propositions sont des <strong>suggestions</strong> : le Client les relit, les modifie au besoin et en assume la responsabilité éditoriale une fois publiées, y compris lorsqu&apos;il active la publication automatique.</p>
      <p>Le Client s&apos;engage à ne publier que des Contenus dont il détient les droits, dans le respect du droit d&apos;auteur, du droit à l&apos;image, de la vie privée et des lois en vigueur.</p>
    </>,
  },
  {
    id: "interdits", titre: "Usages interdits",
    contenu: <>
      <p>Il est interdit d&apos;utiliser Ovyo pour :</p>
      <ul>
        <li>diffuser des contenus illicites, haineux, diffamatoires, violents ou trompeurs ;</li>
        <li>envoyer des messages non sollicités en masse ou manipuler l&apos;audience (faux comptes, faux avis) ;</li>
        <li>usurper l&apos;identité d&apos;une personne ou d&apos;une organisation ;</li>
        <li>tenter d&apos;accéder aux données d&apos;un autre espace ou de perturber le fonctionnement du service ;</li>
        <li>revendre ou mettre à disposition l&apos;accès au service sans accord écrit de l&apos;éditeur.</li>
      </ul>
    </>,
  },
  {
    id: "propriete", titre: "Propriété intellectuelle",
    contenu: <>
      <p>Le Client reste propriétaire de ses Contenus, de sa marque et de son logo. Il autorise Ovyo à les utiliser uniquement pour fournir le service (préparation, mise en forme et publication).</p>
      <p>Le logiciel Ovyo, ses modèles de visuels, sa marque et son logo restent la propriété de Warmachiner Tech. Les visuels produits pour le Client avec ces modèles peuvent être librement utilisés par lui.</p>
    </>,
  },
  {
    id: "disponibilite", titre: "Disponibilité et responsabilité",
    contenu: <>
      <p>Ovyo est fourni avec soin et fait l&apos;objet d&apos;améliorations régulières. L&apos;éditeur met en œuvre des moyens raisonnables pour assurer sa disponibilité, sans garantir un fonctionnement ininterrompu, notamment en cas de maintenance, de panne d&apos;un prestataire ou de changement des règles d&apos;une plateforme.</p>
      <p>La responsabilité de l&apos;éditeur est limitée aux dommages directs prouvés et ne peut excéder les sommes payées par le Client au cours des trois derniers mois.</p>
    </>,
  },
  {
    id: "donnees", titre: "Données personnelles",
    contenu: <p>Le traitement des données personnelles est décrit dans la <Link href="/confidentialite">Politique de confidentialité</Link>. Ovyo n&apos;affiche pas de publicité et ne vend aucune donnée.</p>,
  },
  {
    id: "modifications", titre: "Modification des Conditions",
    contenu: <p>L&apos;éditeur peut faire évoluer les présentes Conditions. Toute modification importante est signalée aux Administrateurs au moins 15 jours avant son entrée en vigueur. La poursuite de l&apos;utilisation du service après cette date vaut acceptation des nouvelles Conditions.</p>,
  },
  {
    id: "droit", titre: "Droit applicable et litiges",
    contenu: <p>Les présentes Conditions sont régies par le droit burkinabè. En cas de différend, les parties recherchent d&apos;abord une solution amiable. À défaut, le litige est porté devant les juridictions compétentes de Ouagadougou.</p>,
  },
  {
    id: "contact", titre: "Contact",
    contenu: <div className="lg-encadre">
      <strong>Une question sur ces Conditions ?</strong>
      <span>Écrivez à <a href="mailto:warmachinertech@gmail.com">warmachinertech@gmail.com</a>. Nous répondons sous 48 heures ouvrées.</span>
    </div>,
  },
];

export default function CGU() {
  return (
    <PageLegale
      titre="Conditions générales d'utilisation"
      sousTitre="Les règles qui encadrent l'utilisation d'Ovyo, l'essai gratuit, les abonnements et les paiements."
      maj="27 novembre 2026" version="2.0" articles={A}
      autre={{ href: "/confidentialite", label: "Politique de confidentialité" }}
    />
  );
}
