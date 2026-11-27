// Mise en page des documents légaux publics (conditions d'utilisation, confidentialité).
import Link from "next/link";
import { OvyoLogo } from "./OvyoLogo";

export type Article = { id: string; titre: string; contenu: React.ReactNode };

export function PageLegale({ titre, sousTitre, maj, version, articles, autre }: {
  titre: string; sousTitre: string; maj: string; version: string; articles: Article[]; autre: { href: string; label: string };
}) {
  return (
    <div className="lg-page">
      <header className="lg-entete">
        <div className="lg-barre">
          <Link href="/" aria-label="Ovyo, accueil" style={{ textDecoration: "none" }}><OvyoLogo taille={30} couleur="#fff" /></Link>
          <nav aria-label="Documents" className="lg-liens">
            <Link href="/cgu">Conditions</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </nav>
        </div>
        <div className="lg-titre">
          <span className="lg-kicker">DOCUMENT LÉGAL</span>
          <h1>{titre}</h1>
          <p>{sousTitre}</p>
          <dl className="lg-meta">
            <div><dt>Dernière mise à jour</dt><dd>{maj}</dd></div>
            <div><dt>Version</dt><dd>{version}</dd></div>
            <div><dt>Éditeur</dt><dd>Warmachiner Tech, Ouagadougou</dd></div>
          </dl>
        </div>
      </header>

      <div className="lg-corps">
        <nav className="lg-sommaire" aria-labelledby="lg-som">
          <strong id="lg-som">Sommaire</strong>
          <ol>{articles.map((a, i) => <li key={a.id}><a href={`#${a.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{a.titre}</a></li>)}</ol>
        </nav>

        <main className="lg-articles">
          {articles.map((a, i) => (
            <section key={a.id} id={a.id} className="lg-article" aria-labelledby={`${a.id}-t`}>
              <h2 id={`${a.id}-t`}><span className="lg-num">Article {i + 1}</span>{a.titre}</h2>
              <div className="lg-texte">{a.contenu}</div>
            </section>
          ))}
          <footer className="lg-pied">
            <span>© {new Date().getFullYear()} Warmachiner Tech · Ovyo</span>
            <Link href={autre.href}>{autre.label} →</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
