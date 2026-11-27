// Page d'accueil publique d'Ovyo : ce que voient les visiteurs sans session (servie aussi sur « / » par le middleware).
import Link from "next/link";
import type { Metadata } from "next";
import { TRACES_RESEAUX, type Reseau } from "@/components/IconesReseaux";
import { FORMULES, prixTexte } from "@/lib/formules";

export const metadata: Metadata = {
  title: "Ovyo · Votre page ne sera plus jamais silencieuse",
  description: "Ovyo prépare, illustre et publie vos posts sur Facebook, Instagram et votre site. Essai gratuit 7 jours, paiement Mobile Money.",
  robots: { index: true, follow: true },
};

const RESEAUX: [Reseau, string, string][] = [
  ["facebook", "Facebook", "#1877F2"], ["instagram", "Instagram", "#DD2A7B"], ["wordpress", "WordPress", "#21759B"], ["telegram", "Telegram", "#26A5E4"],
];
const SANS = ["Des semaines sans rien publier", "Chaque matin, la même question : on publie quoi ?", "Des posts qui partent en retard, ou pas du tout", "Une image qui change d’un post à l’autre"];
const AVEC = ["Un rendez-vous régulier avec votre public", "Des idées tirées de l’actualité de votre secteur", "Des publications programmées, qui partent à l’heure", "Votre logo et vos couleurs sur chaque post"];
const METIERS = [
  { t: "Médias en ligne", d: "Tenez votre audience informée, chaque jour, sans courir après l’actu.", tags: ["L’essentiel du jour", "Citation", "Récap de la semaine"], c: "#2563EB", bg: "#EAF0FF", ic: "M4 5h12v14H6a2 2 0 0 1-2-2V5zM16 9h4v8a2 2 0 0 1-2 2M8 9h4M8 13h4M8 17h2" },
  { t: "Entreprises et marques", d: "Restez visible auprès de vos clients avec des posts réguliers et soignés.", tags: ["Nouveauté", "Conseil", "Jeu concours"], c: "#C2410C", bg: "#FFF1E8", ic: "M3 9l1.5-5h15L21 9M3 9h18v11H3zM3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-6h6v6" },
  { t: "Institutions et ONG", d: "Sensibilisez et informez avec un ton juste et officiel.", tags: ["Vrai ou faux", "Journée mondiale", "Communiqué"], c: "#1F7A52", bg: "#E6F4EC", ic: "M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6z" },
  { t: "Agences", d: "Gérez plusieurs clients, chacun avec son propre style.", tags: ["Multi-clients", "Un style par client", "Bientôt"], c: "#7C3AED", bg: "#F1EBFE", ic: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" },
];
const ETAPES = [
  ["01", "Décrivez votre activité", "Secteur, logo, couleurs, style. Quatre questions, deux minutes."],
  ["02", "Reliez vos comptes", "Facebook, Instagram, votre site et Telegram, en quelques clics."],
  ["03", "Ovyo prépare et publie", "Validez d’un geste, ou laissez le pilote automatique faire."],
];
const FAQ = [
  ["Dois-je donner mes mots de passe ?", "Non. Vous reliez vos comptes vous-même, par la page officielle de chaque réseau. Ovyo ne voit jamais vos mots de passe."],
  ["Puis-je relire les posts avant publication ?", "Oui. Vous choisissez : valider chaque post, ou laisser le pilote automatique publier pour vous."],
  ["Comment se passe le paiement ?", "Par Orange Money, Moov Money, Wave ou carte bancaire, pour 30 jours à la fois, sans prélèvement automatique."],
  ["Que se passe-t-il après l’essai gratuit ?", "Rien n’est payé sans votre accord. Sans formule choisie, les publications automatiques s’arrêtent simplement."],
  ["Mes visuels ressembleront-ils à ceux des autres ?", "Non. Chaque espace a son logo, ses couleurs, sa police et son style."],
];
const DETAILS: Record<string, { pour: string; points: string[] }> = {
  essentiel: { pour: "Petites structures", points: ["40 publications par mois", "Visuels à vos couleurs", "Publication sur Facebook", "Alertes sur Telegram", "Rubriques automatiques"] },
  pro: { pour: "Recommandé", points: ["150 publications par mois", "Tous vos canaux reliés", "Veille de votre secteur", "Pilote automatique", "Réponses aux commentaires"] },
  agence: { pour: "Bientôt disponible", points: ["Jusqu’à 5 clients gérés", "Publications illimitées", "Un style par client", "Tout le contenu de Pro", "Un espace par client"] },
};

const Logo = ({ t = 30 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="30" fill="#2563EB" /><circle cx="45" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" /><circle cx="75" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" /><circle cx="96" cy="26" r="8" fill="#FF6A1A" /></svg>
);
const Coche = ({ c }: { c: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

export default function Decouvrir() {
  return (
    <div className="lp-page">
      {/* Haut de page */}
      <section className="lp-hero">
        <div className="lp-wrap">
          <header className="lp-nav">
            <Link href="/" className="lp-marque" aria-label="Ovyo, accueil"><Logo />OVYO.</Link>
            <nav aria-label="Principal" className="lp-liens">
              <a href="#pourquoi">Pourquoi Ovyo</a><a href="#pour-qui">Pour qui</a><a href="#tarifs">Tarifs</a><a href="#faq">Questions</a><Link href="/acces">Connexion</Link>
            </nav>
            <Link href="/inscription" className="lp-pill lp-pill-d lp-pill-s">Essai gratuit</Link>
          </header>
          <div className="lp-hero-txt">
            <h1>Votre page ne sera plus jamais silencieuse. <span>Ovyo prépare, illustre et publie pour vous.</span></h1>
            <p className="lp-p lp-lead">Des posts écrits pour votre public, des visuels à vos couleurs, publiés à l’heure sur Facebook, Instagram et votre site.</p>
            <div className="lp-btns">
              <Link href="/inscription" className="lp-pill lp-pill-d lp-pill-l">Essayer 7 jours gratuitement
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
              <a href="#etapes" className="lp-pill lp-pill-o lp-pill-l">Comment ça marche</a>
            </div>
            <span className="lp-note">Sans carte bancaire · Paiement Mobile Money ensuite</span>
          </div>
          <div className="lp-reseaux">
            <span>Ovyo publie sur</span>
            {RESEAUX.map(([r, n, c]) => <span key={r} className="lp-reseau"><svg width="22" height="22" viewBox="0 0 24 24" fill={c} aria-hidden="true"><path d={TRACES_RESEAUX[r]} /></svg>{n}</span>)}
          </div>
        </div>
      </section>

      {/* Pourquoi */}
      <section id="pourquoi" className="lp-sec lp-blanc">
        <div className="lp-wrap lp-col">
          <div className="lp-tete">
            <h2 className="lp-t2" style={{ maxWidth: 640 }}>Tenir une page, c’est un travail de tous les jours. <em>Ovyo s’en charge.</em></h2>
            <p className="lp-p">Vous gardez votre temps pour votre métier. Ovyo s’occupe de la régularité.</p>
          </div>
          <div className="lp-duo">
            <div className="lp-carte lp-creme">
              <strong className="lp-h3" style={{ color: "#8A8A94" }}>Sans Ovyo</strong>
              <ul className="lp-liste">{SANS.map((t) => <li key={t}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B4B2AA" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>{t}</li>)}</ul>
            </div>
            <div className="lp-carte lp-noir">
              <strong className="lp-h3">Avec Ovyo</strong>
              <ul className="lp-liste lp-liste-n">{AVEC.map((t) => <li key={t}><Coche c="#FFFFFF" />{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* Votre marque */}
      <section id="marque" className="lp-sec lp-photo">
        <div className="lp-wrap lp-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 640 }}>
            <h2 className="lp-t2" style={{ color: "#FFFFFF" }}>Chaque post porte <em style={{ color: "#8E9BBA" }}>votre marque.</em></h2>
            <p className="lp-p" style={{ maxWidth: 480, color: "#C3CCE0" }}>Vous réglez votre identité une seule fois, à l’inscription. Ovyo l’applique ensuite à tout ce qu’il publie.</p>
          </div>
          <div className="lp-ident">
            <div className="lp-ident-l">
              <span className="lp-num">01</span>
              <div className="lp-ident-t"><strong>Votre logo</strong><span>Sur chaque visuel, à la bonne place, sans rien retoucher.</span></div>
              <div className="lp-tuile" aria-hidden="true" style={{ position: "relative" }}>
                <span style={{ position: "absolute", inset: 16, border: "1.5px dashed #C9C7BE", borderRadius: 8 }} />
                <span style={{ position: "absolute", right: 22, bottom: 22 }}><Logo t={30} /></span>
                <span style={{ position: "absolute", left: 25, top: 27, width: 42, height: 5, borderRadius: 3, background: "#101014" }} />
                <span style={{ position: "absolute", left: 25, top: 37, width: 30, height: 5, borderRadius: 3, background: "#DDDBD3" }} />
              </div>
            </div>
            <div className="lp-ident-l">
              <span className="lp-num">02</span>
              <div className="lp-ident-t"><strong>Vos couleurs</strong><span>Votre palette appliquée partout, pour qu’on vous reconnaisse au premier coup d’œil.</span></div>
              <div className="lp-tuile" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="lp-rond" style={{ background: "#2563EB" }} /><span className="lp-rond" style={{ background: "#FF6A1A", marginLeft: -13, mixBlendMode: "multiply" }} /><span className="lp-rond" style={{ background: "#101014", marginLeft: -13, opacity: 0.9 }} />
              </div>
            </div>
            <div className="lp-ident-l">
              <span className="lp-num">03</span>
              <div className="lp-ident-t"><strong>Votre police</strong><span>Les mêmes lettres sur tous vos posts, pour une image cohérente.</span></div>
              <div className="lp-tuile" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 43, lineHeight: 1, color: "#101014" }}>A</span>
                <span style={{ fontFamily: "var(--font-mont), sans-serif", fontWeight: 600, fontSize: 43, lineHeight: 1, color: "#2563EB" }}>a</span>
              </div>
            </div>
            <div className="lp-ident-l">
              <span className="lp-num">04</span>
              <div className="lp-ident-t"><strong>Votre ton</strong><span>Sérieux, chaleureux ou énergique : Ovyo écrit comme vous parlez à votre public.</span></div>
              <div className="lp-tuile" aria-hidden="true" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "0 12px" }}>
                <span className="lp-bulle" style={{ alignSelf: "flex-start", background: "#F4F3EF", color: "#3A3A44" }}>Sérieux</span>
                <span className="lp-bulle" style={{ alignSelf: "flex-end", background: "#2563EB", color: "#FFFFFF", borderRadius: "10px 10px 3px 10px" }}>Chaleureux</span>
                <span className="lp-bulle" style={{ alignSelf: "flex-start", background: "#FF6A1A", color: "#111114" }}>Énergique !</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section id="pour-qui" className="lp-sec lp-creme-bg">
        <div className="lp-wrap lp-col">
          <div className="lp-tete">
            <h2 className="lp-t2">Pensé pour <em>votre métier.</em></h2>
            <p className="lp-p">À l’inscription, vous dites qui vous êtes. Ovyo choisit les rubriques et le ton qui vous conviennent.</p>
          </div>
          <div className="lp-grille">
            {METIERS.map((m) => (
              <div key={m.t} className="lp-metier">
                <span className="lp-metier-ic" style={{ background: m.bg }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={m.c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={m.ic} /></svg></span>
                <strong className="lp-h3" style={{ fontSize: 22 }}>{m.t}</strong>
                <span className="lp-p" style={{ fontSize: 15 }}>{m.d}</span>
                <div className="lp-tags">{m.tags.map((t) => <span key={t} style={{ color: m.c, background: m.bg }}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section id="etapes" className="lp-creme-bg" style={{ padding: "0 0 112px" }}>
        <div className="lp-wrap">
          <div className="lp-bleu">
            <div className="lp-tete">
              <h2 className="lp-t2" style={{ color: "#FFFFFF" }}>Prêt en 10 minutes. <em style={{ color: "#A9C2FF" }}>Actif tous les jours.</em></h2>
              <Link href="/inscription" className="lp-pill lp-pill-w lp-pill-l">Commencer maintenant</Link>
            </div>
            <div className="lp-etapes">
              <span className="lp-fil" aria-hidden="true" />
              {ETAPES.map(([n, t, d]) => (
                <div key={n} className="lp-etape">
                  <span className="lp-etape-n">{n}</span>
                  <strong className="lp-h3" style={{ fontSize: 22, marginTop: 8 }}>{t}</strong>
                  <span style={{ fontSize: 15, lineHeight: 1.6, color: "#DCE6FF", maxWidth: 300 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="lp-sec lp-sombre">
        <div className="lp-wrap lp-col" style={{ gap: 56 }}>
          <div className="lp-tete">
            <h2 className="lp-t2" style={{ color: "#FFFFFF" }}>Choisissez votre rythme. <em style={{ color: "#6E6E7A" }}>Changez de formule quand vous voulez.</em></h2>
            <p className="lp-p" style={{ color: "#A9A9B6" }}>7 jours d’essai gratuit. Ensuite, 30 jours à la fois, par Mobile Money ou carte. Sans engagement.</p>
          </div>
          <div className="lp-plans">
            {FORMULES.map((f) => {
              const pro = f.id === "pro", d = DETAILS[f.id];
              return (
                <div key={f.id} className={`lp-plan${pro ? " lp-plan-pro" : ""}`}>
                  <div className="lp-plan-h">
                    <span style={{ fontSize: 13, color: pro ? "#C2410C" : "#8A8A96", fontWeight: pro ? 600 : 400 }}>{d.pour}</span>
                    <strong className="lp-h3" style={{ fontSize: 20 }}>{f.nom}</strong>
                    <span style={{ marginTop: 10 }}><strong className="lp-prix">{prixTexte(f.prix)}</strong> <span style={{ fontSize: 13, color: pro ? "#6B6B76" : "#8A8A96" }}>/ mois</span></span>
                  </div>
                  <div className="lp-plan-b">
                    {d.points.map((p) => <span key={p} className="lp-chk"><Coche c={pro ? "#2563EB" : "#8A8A96"} />{p}</span>)}
                    {f.bientot
                      ? <a href="mailto:warmachinertech@gmail.com?subject=Ovyo%20Agence" className="lp-pill lp-pill-o lp-pill-sombre" style={{ marginTop: 14 }}>Être prévenu</a>
                      : <Link href="/inscription" className={`lp-pill ${pro ? "lp-pill-d" : "lp-pill-o lp-pill-sombre"}`} style={{ marginTop: 14 }}>Commencer</Link>}
                  </div>
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 13, color: "#8A8A96", textAlign: "center" }}>Orange Money · Moov Money · Wave · Carte bancaire</span>
        </div>
      </section>

      {/* Questions */}
      <section id="faq" className="lp-sec">
        <div className="lp-wrap lp-faq-wrap">
          <h2 className="lp-t2" style={{ flex: "0 1 360px", fontSize: "clamp(30px, 3.4vw, 44px)" }}>Vous vous <em>demandez peut-être…</em></h2>
          <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ.map(([q, r], i) => (
              <details key={q} className="lp-faq" open={i === 0}>
                <summary>{q}<span className="lp-faq-ic" aria-hidden="true" /></summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Dernier appel et pied de page */}
      <footer className="lp-pied">
        <div className="lp-wrap lp-col" style={{ gap: 64 }}>
          <div className="lp-tete">
            <h2 className="lp-t2" style={{ color: "#FFFFFF", maxWidth: 720 }}>Votre prochain post peut être prêt <em style={{ color: "#6E6E7A" }}>avant ce soir.</em></h2>
            <Link href="/inscription" className="lp-pill lp-pill-w lp-pill-l">Créer mon espace gratuit</Link>
          </div>
          <div className="lp-pied-liens">
            <span style={{ maxWidth: 300, lineHeight: 1.6 }}>Ovyo prépare et publie la communication des médias, entreprises, institutions et agences d’Afrique de l’Ouest.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 56 }}>
              <div><strong>Menu</strong><a href="#pourquoi">Pourquoi Ovyo</a><a href="#tarifs">Tarifs</a><a href="#faq">Questions</a></div>
              <div><strong>Légal</strong><Link href="/cgu">Conditions d’utilisation</Link><Link href="/confidentialite">Confidentialité</Link></div>
              <div><strong>Contact</strong><a href="mailto:warmachinertech@gmail.com">warmachinertech@gmail.com</a><span>Ouagadougou, Burkina Faso</span></div>
            </div>
          </div>
          <span className="lp-geant" aria-hidden="true">OVYO.</span>
          <span style={{ fontSize: 12, color: "#6E6E7A" }}>© {new Date().getFullYear()} Warmachiner Tech. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
}
