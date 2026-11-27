// Conditions générales d'utilisation d'Ovyo (page publique, demandée aussi par Meta et TikTok).
import Link from "next/link";
import { PageLegale, type Article } from "@/components/PageLegale";

export const metadata = { title: "Conditions générales d'utilisation · Ovyo" };

const MAIL = <a href="mailto:warmachinertech@gmail.com">warmachinertech@gmail.com</a>;

const A: Article[] = [
  {
    id: "objet", titre: "Objet et éditeur",
    contenu: <>
      <p>Les présentes conditions générales d&apos;utilisation (les « Conditions ») encadrent l&apos;accès et l&apos;utilisation du service <strong>Ovyo</strong>.</p>
      <p>Ovyo est un outil d&apos;aide à la communication. Il aide les organisations à préparer leurs publications et leurs visuels, à les programmer sur leurs propres comptes et à animer leur communauté.</p>
      <div className="lg-encadre">
        <strong>Éditeur du service</strong>
        <span>Warmachiner Tech, Ouagadougou, Burkina Faso</span>
        <span>Contact : {MAIL}</span>
      </div>
    </>,
  },
  {
    id: "definitions", titre: "Définitions",
    contenu: <dl className="lg-defs">
      <dt>Éditeur</dt><dd>Warmachiner Tech, qui exploite le service Ovyo.</dd>
      <dt>Client</dt><dd>L&apos;organisation ou la personne qui ouvre un espace sur Ovyo.</dd>
      <dt>Espace</dt><dd>L&apos;environnement propre à chaque Client : réglages, membres, contenus et comptes reliés.</dd>
      <dt>Administrateur</dt><dd>La personne qui gère l&apos;espace, ses membres et son abonnement.</dd>
      <dt>Formule</dt><dd>L&apos;offre payante choisie par le Client.</dd>
      <dt>Contenus</dt><dd>Les textes, visuels, photos et publications créés, importés ou publiés depuis Ovyo.</dd>
    </dl>,
  },
  {
    id: "acceptation", titre: "Acceptation des Conditions",
    contenu: <p>La création d&apos;un espace ou l&apos;utilisation d&apos;Ovyo vaut acceptation pleine et entière des présentes Conditions et de la <Link href="/confidentialite">Politique de confidentialité</Link>. La personne qui les accepte au nom d&apos;une organisation déclare être habilitée à l&apos;engager. Le Client qui n&apos;accepte pas ces Conditions doit cesser d&apos;utiliser le service.</p>,
  },
  {
    id: "compte", titre: "Compte et espace client",
    contenu: <ul>
      <li>Le Client fournit des informations exactes et les tient à jour.</li>
      <li>Chaque utilisateur est seul responsable de la confidentialité de ses identifiants et de toutes les actions réalisées depuis son compte.</li>
      <li>L&apos;Administrateur choisit les membres de son espace et leurs droits, et répond de leurs actions.</li>
    </ul>,
  },
  {
    id: "essai", titre: "Essai gratuit",
    contenu: <p>L&apos;Éditeur peut proposer un essai gratuit, limité dans le temps et en nombre de publications, selon les conditions affichées lors de l&apos;inscription. L&apos;essai permet au Client de vérifier que le service lui convient avant tout paiement. À son terme, les publications automatiques s&apos;arrêtent jusqu&apos;au choix d&apos;une Formule.</p>,
  },
  {
    id: "abonnement", titre: "Formules, prix et paiement",
    contenu: <>
      <ul>
        <li>Les Formules, leur contenu et leurs prix sont ceux affichés sur la page Abonnement au moment du paiement. L&apos;Éditeur peut les faire évoluer à tout moment.</li>
        <li>Le paiement s&apos;effectue par Mobile Money ou par carte bancaire, auprès d&apos;un prestataire de paiement sécurisé.</li>
        <li>Chaque paiement donne accès à la Formule choisie pour <strong>30 jours</strong>. L&apos;abonnement n&apos;est pas reconduit automatiquement : le Client le renouvelle lui-même.</li>
        <li>Un renouvellement effectué avant la fin de la période en cours s&apos;ajoute à la date de fin prévue.</li>
        <li>Lorsque le nombre de publications prévu par la Formule est atteint, les publications automatiques s&apos;arrêtent jusqu&apos;au renouvellement ou au passage à une Formule supérieure.</li>
      </ul>
    </>,
  },
  {
    id: "remboursement", titre: "Absence de remboursement",
    contenu: <p>Tout paiement est <strong>ferme et définitif</strong>. Aucune somme versée n&apos;est remboursée, quel qu&apos;en soit le motif, y compris en cas de non-utilisation du service, de résultats jugés insuffisants, de suspension pour manquement aux présentes Conditions ou de fermeture de l&apos;espace en cours de période.</p>,
  },
  {
    id: "fin", titre: "Fin d'abonnement, suspension et fermeture",
    contenu: <ul>
      <li>Sans renouvellement, les publications automatiques s&apos;arrêtent à la date de fin. L&apos;Éditeur peut ensuite supprimer l&apos;espace et ses Contenus. Il appartient au Client de conserver ses propres copies.</li>
      <li>L&apos;Éditeur peut suspendre ou fermer un espace, sans préavis ni indemnité, en cas de manquement aux présentes Conditions, d&apos;usage frauduleux ou abusif, ou à la demande d&apos;une autorité compétente.</li>
      <li>L&apos;Administrateur peut demander la fermeture de son espace à tout moment par e-mail.</li>
    </ul>,
  },
  {
    id: "reseaux", titre: "Comptes de réseaux sociaux et sites reliés",
    contenu: <>
      <p>Ovyo publie uniquement sur les comptes que le Client relie lui-même et qu&apos;il est autorisé à gérer. Le Client peut retirer cet accès à tout moment.</p>
      <p>Les plateformes (Facebook, Instagram, TikTok, sites web…) restent maîtresses de leurs règles, de leur fonctionnement et de leurs décisions. L&apos;Éditeur n&apos;est pas responsable d&apos;une restriction, d&apos;une suspension ou d&apos;une perte d&apos;audience décidée par une plateforme, ni de l&apos;indisponibilité d&apos;une fonction de publication.</p>
    </>,
  },
  {
    id: "contenus", titre: "Contenus et responsabilité éditoriale",
    contenu: <>
      <p>Les textes, visuels et réponses proposés par Ovyo sont générés automatiquement et constituent de simples <strong>suggestions</strong>. Ils peuvent contenir des erreurs ou des imprécisions.</p>
      <p>Le Client est le seul éditeur de ses publications. Il lui appartient de les relire et de les valider. Il en assume l&apos;entière responsabilité une fois publiées, y compris lorsqu&apos;il choisit la publication automatique.</p>
      <p>Le Client garantit détenir les droits sur les Contenus qu&apos;il importe ou publie, et garantit l&apos;Éditeur contre toute réclamation d&apos;un tiers à ce sujet.</p>
    </>,
  },
  {
    id: "interdits", titre: "Usages interdits",
    contenu: <>
      <p>Il est interdit d&apos;utiliser Ovyo pour :</p>
      <ul>
        <li>diffuser des contenus illicites, haineux, diffamatoires, violents ou trompeurs ;</li>
        <li>envoyer des messages non sollicités en masse ou manipuler l&apos;audience ;</li>
        <li>usurper l&apos;identité d&apos;une personne ou d&apos;une organisation ;</li>
        <li>porter atteinte au fonctionnement ou à la sécurité du service ;</li>
        <li>revendre l&apos;accès au service sans accord écrit de l&apos;Éditeur.</li>
      </ul>
    </>,
  },
  {
    id: "propriete", titre: "Propriété intellectuelle",
    contenu: <>
      <p>Le Client reste propriétaire de ses Contenus, de sa marque et de son logo. Il autorise l&apos;Éditeur à les utiliser dans la seule mesure nécessaire au fonctionnement du service.</p>
      <p>Le service Ovyo, ses modèles de visuels, sa marque et son logo sont la propriété exclusive de Warmachiner Tech. Toute reproduction ou copie du service est interdite.</p>
    </>,
  },
  {
    id: "disponibilite", titre: "Disponibilité et limitation de responsabilité",
    contenu: <>
      <p>Ovyo est fourni « en l&apos;état ». L&apos;Éditeur s&apos;efforce d&apos;en assurer le bon fonctionnement, sans garantir qu&apos;il sera disponible en permanence, exempt d&apos;erreurs, ou qu&apos;il produira un résultat particulier (audience, abonnés, ventes).</p>
      <p>L&apos;Éditeur ne saurait être tenu responsable des dommages indirects, tels qu&apos;une perte de chiffre d&apos;affaires, d&apos;audience, de données ou d&apos;image. En tout état de cause, sa responsabilité est limitée au montant payé par le Client pour la période d&apos;abonnement en cours.</p>
    </>,
  },
  {
    id: "donnees", titre: "Données personnelles",
    contenu: <p>Le traitement des données personnelles est décrit dans la <Link href="/confidentialite">Politique de confidentialité</Link>.</p>,
  },
  {
    id: "modifications", titre: "Modification des Conditions",
    contenu: <p>L&apos;Éditeur peut modifier les présentes Conditions à tout moment. La version applicable est celle publiée sur cette page. La poursuite de l&apos;utilisation du service vaut acceptation de la version en vigueur.</p>,
  },
  {
    id: "droit", titre: "Droit applicable et litiges",
    contenu: <p>Les présentes Conditions sont régies par le droit burkinabè. En cas de différend, le Client s&apos;engage à contacter d&apos;abord l&apos;Éditeur pour rechercher une solution amiable. À défaut, le litige est porté devant les juridictions compétentes de Ouagadougou.</p>,
  },
  {
    id: "contact", titre: "Contact",
    contenu: <div className="lg-encadre">
      <strong>Une question sur ces Conditions ?</strong>
      <span>Écrivez à {MAIL}.</span>
    </div>,
  },
];

export default function CGU() {
  return (
    <PageLegale
      titre="Conditions générales d'utilisation"
      sousTitre="Les règles qui encadrent l'utilisation d'Ovyo, les abonnements et les paiements."
      maj="27 novembre 2026" version="2.0" articles={A}
      autre={{ href: "/confidentialite", label: "Politique de confidentialité" }}
    />
  );
}
