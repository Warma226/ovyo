// Formules d'abonnement Ovyo (prix en francs CFA, payés chaque mois par Mobile Money ou carte via Chariow).
// Fichier partagé navigateur / serveur : aucun secret ici.
export type FormuleId = "essentiel" | "pro" | "agence";

export type Formule = {
  id: FormuleId;
  nom: string;
  prix: number; // F CFA par mois
  pour: string;
  postsParMois: number | null; // null = illimité
  points: string[];
  bientot?: boolean;
};

export const DUREE_JOURS = 30;

export const FORMULES: Formule[] = [
  {
    id: "essentiel", nom: "Essentiel", prix: 10000, pour: "Petite entreprise, ONG, institution locale", postsParMois: 40,
    points: ["40 publications par mois", "Facebook et alertes Telegram", "Visuels à vos couleurs", "Rubriques automatiques"],
  },
  {
    id: "pro", nom: "Pro", prix: 20000, pour: "Média, marque active", postsParMois: 150,
    points: ["150 publications par mois", "Tous les canaux reliés", "Veille et pilote automatique", "VOA répond aux commentaires"],
  },
  {
    id: "agence", nom: "Agence", prix: 45000, pour: "Community manager, agence", postsParMois: null,
    points: ["Jusqu'à 5 clients", "Publications illimitées", "Tout le contenu de Pro"], bientot: true,
  },
];

export const formuleDe = (id: string | null | undefined): Formule | undefined => FORMULES.find((f) => f.id === id);
export const prixTexte = (n: number) => `${n.toLocaleString("fr-FR").replace(/ | /g, " ")} F`;
