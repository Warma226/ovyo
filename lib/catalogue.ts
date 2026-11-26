// Catalogue Ovyo : profils, secteurs, rubriques, styles et polices proposés à chaque client.
// Le profil choisi à l'inscription active ses rubriques ; le client peut ensuite en ajouter ou en retirer.

export type Profil = "media" | "entreprise" | "institution" | "agence";
export type Style = "sobre" | "moderne" | "energique" | "institutionnel";

export type Rubrique = { id: string; nom: string; description: string; rythme: string; auto: boolean; profils: Profil[]; jeu?: boolean };

export const RUBRIQUES_OVYO: Rubrique[] = [
  // Média
  { id: "essentiel", nom: "L'essentiel du matin", description: "3 à 5 infos du jour, résumées", rythme: "Chaque matin", auto: true, profils: ["media"] },
  { id: "urgent", nom: "Urgent", description: "L'info importante qui tombe", rythme: "Dès qu'elle arrive", auto: false, profils: ["media"] },
  { id: "chiffre", nom: "Le chiffre du jour", description: "Un chiffre fort tiré de l'actu", rythme: "Chaque jour", auto: true, profils: ["media", "institution"] },
  { id: "question", nom: "La question du jour", description: "Un sondage pour faire réagir", rythme: "Chaque jour", auto: true, profils: ["media"] },
  { id: "recap", nom: "Le récap de la semaine", description: "Les 5 infos marquantes", rythme: "Le vendredi", auto: true, profils: ["media"] },
  { id: "citation", nom: "Citation", description: "Une phrase forte, confrontée à l'actu", rythme: "Chaque jour", auto: true, profils: ["media"] },
  // Entreprise
  { id: "conseil", nom: "Conseil pratique", description: "Une astuce utile liée à votre métier", rythme: "2 fois par semaine", auto: true, profils: ["entreprise"] },
  { id: "produit", nom: "Produit à la une", description: "Présenter une offre ou un service", rythme: "Chaque semaine", auto: false, profils: ["entreprise"] },
  { id: "promo", nom: "Promo", description: "Réduction ou offre limitée", rythme: "Ponctuel", auto: false, profils: ["entreprise"] },
  { id: "arnaque", nom: "Alerte arnaque", description: "Prévenir les fraudes à votre nom", rythme: "Dès qu'il y en a une", auto: false, profils: ["entreprise"] },
  { id: "coulisses", nom: "Coulisses / équipe", description: "Les personnes derrière la marque", rythme: "Chaque semaine", auto: false, profils: ["entreprise"] },
  { id: "pratique", nom: "Info pratique", description: "Horaires, fermetures, nouvelle agence", rythme: "Ponctuel", auto: false, profils: ["entreprise", "institution"] },
  { id: "avis", nom: "Avis client", description: "De vrais avis publiés par vos clients", rythme: "Chaque mois", auto: false, profils: ["entreprise"] },
  // Institution / ONG
  { id: "saviez", nom: "Le saviez-vous ?", description: "Un fait simple sur votre cause", rythme: "2 fois par semaine", auto: true, profils: ["institution"] },
  { id: "vraifaux", nom: "Vrai ou faux", description: "Casser une idée reçue", rythme: "Chaque semaine", auto: true, profils: ["institution"] },
  { id: "terrain", nom: "Sur le terrain", description: "Photos d'une activité", rythme: "Après chaque activité", auto: false, profils: ["institution"] },
  { id: "journee", nom: "Journées internationales", description: "Les journées mondiales liées à votre cause", rythme: "Automatique", auto: true, profils: ["institution", "entreprise"] },
  { id: "communique", nom: "Communiqué", description: "Annonce officielle", rythme: "Ponctuel", auto: false, profils: ["institution", "entreprise"] },
  { id: "agenda", nom: "Appel / agenda", description: "Événement, inscription, recrutement", rythme: "Ponctuel", auto: false, profils: ["institution"] },
  { id: "temoignage", nom: "Témoignage", description: "La parole d'un bénéficiaire", rythme: "Chaque mois", auto: false, profils: ["institution"] },
  // Jeux (tous profils)
  { id: "quiz", nom: "Quiz du vendredi", description: "Une question, 3 réponses", rythme: "Le vendredi", auto: true, profils: ["media", "entreprise", "institution"], jeu: true },
  { id: "concours", nom: "Concours", description: "Un lot à gagner, tirage au sort", rythme: "Ponctuel", auto: false, profils: ["media", "entreprise"], jeu: true },
  { id: "mystere", nom: "Photo mystère", description: "Deviner un lieu à partir d'un détail", rythme: "Ponctuel", auto: false, profils: ["media", "entreprise", "institution"], jeu: true },
  { id: "complete", nom: "Complétez la phrase", description: "Les abonnés finissent la phrase", rythme: "Chaque semaine", auto: true, profils: ["media", "entreprise", "institution"], jeu: true },
];

// Rubriques cochées d'office selon le profil (l'agence configure ensuite chaque client).
export const PAR_DEFAUT: Record<Profil, string[]> = {
  media: ["essentiel", "urgent", "chiffre", "question", "recap", "citation", "quiz"],
  entreprise: ["conseil", "produit", "promo", "arnaque", "pratique", "journee", "quiz"],
  institution: ["saviez", "vraifaux", "chiffre", "terrain", "journee", "communique", "agenda"],
  agence: ["conseil", "produit", "promo", "journee", "quiz"],
};

export const PROFILS: { id: Profil; nom: string; detail: string }[] = [
  { id: "media", nom: "Média", detail: "Radio, télé, site d'info, page d'actu" },
  { id: "entreprise", nom: "Entreprise", detail: "Banque, commerce, restaurant, télécom…" },
  { id: "institution", nom: "Institution / ONG", detail: "Ministère, association, santé, école" },
  { id: "agence", nom: "Agence", detail: "Vous gérez plusieurs clients" },
];

export const SECTEURS: Record<Profil, string[]> = {
  media: ["Généraliste", "Tech", "Sport", "Culture", "Économie", "Santé"],
  entreprise: ["Banque / assurance", "Mobile Money / fintech", "Télécom", "Commerce", "Restaurant", "Immobilier / BTP", "Santé / pharmacie", "Autre"],
  institution: ["Santé", "Éducation", "Environnement", "Droits / citoyenneté", "Agriculture", "Administration", "Autre"],
  agence: ["Communication", "Marketing digital", "Événementiel", "Autre"],
};

export const STYLES: { id: Style; nom: string; detail: string }[] = [
  { id: "sobre", nom: "Sobre", detail: "Fond blanc, traits fins, beaucoup d'espace" },
  { id: "moderne", nom: "Moderne", detail: "Cartes arrondies, couleurs douces" },
  { id: "energique", nom: "Énergique", detail: "Fond couleur, très gras, percutant" },
  { id: "institutionnel", nom: "Institutionnel", detail: "Sérieux, police à empattements, centré" },
];

export const POLICES = ["Plus Jakarta Sans", "Inter", "Montserrat", "Poppins", "Archivo", "Oswald", "Source Serif 4", "Playfair Display"] as const;

export const TONS = [
  { id: "formel", nom: "Formel", detail: "Vouvoiement, phrases posées" },
  { id: "chaleureux", nom: "Chaleureux", detail: "Proche, simple, bienveillant" },
  { id: "dynamique", nom: "Dynamique", detail: "Vif, accrocheur, un peu d'humour" },
] as const;

export const PAYS = ["Burkina Faso", "Côte d'Ivoire", "Sénégal", "Mali", "Niger", "Bénin", "Togo", "Guinée", "Cameroun", "Gabon", "RD Congo", "Congo", "Tchad", "Madagascar", "France", "Autre"];
