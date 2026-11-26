"use client";
// Bienvenue : le questionnaire qui règle Ovyo pour ce client (activité, identité, style, rubriques).
import { useEffect, useMemo, useState } from "react";
import { ImageField } from "@/components/ImageField";
import { OvyoLogo } from "@/components/OvyoLogo";
import { PAR_DEFAUT, PAYS, POLICES, PROFILS, RUBRIQUES_OVYO, SECTEURS, STYLES, TONS, type Profil, type Style } from "@/lib/catalogue";

type Etat = {
  nom: string; type: Profil; logo: string; couleur: string; couleur2: string;
  secteur: string; pays: string; ville: string; site: string; description: string;
  style: Style; police: string; ton: string; rubriques: string[];
};

const COULEURS = ["#2563EB", "#E11D48", "#047857", "#0F766E", "#7C3AED", "#EA580C", "#111827", "#B45309"];
const ETAPES = ["Activité", "Identité", "Style", "Rubriques"];
const FONTS_URL = "https://fonts.googleapis.com/css2?" + POLICES.map((p) => `family=${p.replace(/ /g, "+")}:wght@600;800`).join("&") + "&display=swap";

export default function Bienvenue() {
  const [e, setE] = useState<Etat | null>(null);
  const [etape, setEtape] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/espace").then((r) => r.json()).then((d) => {
      const type = (d.type ?? "media") as Profil;
      const p = d.profil ?? {};
      setE({
        nom: d.nom ?? "", type, logo: d.logo ?? "", couleur: d.couleur ?? "#2563EB", couleur2: p.couleur2 ?? "#111827",
        secteur: p.secteur ?? "", pays: p.pays ?? "Burkina Faso", ville: p.ville ?? "", site: p.site ?? "", description: p.description ?? "",
        style: (p.style ?? "moderne") as Style, police: p.police ?? "Plus Jakarta Sans", ton: p.ton ?? (type === "institution" ? "formel" : "chaleureux"),
        rubriques: Array.isArray(p.rubriques) && p.rubriques.length ? p.rubriques : PAR_DEFAUT[type],
      });
    }).catch(() => setError("Chargement impossible. Rechargez la page."));
  }, []);

  const maj = (m: Partial<Etat>) => setE((x) => (x ? { ...x, ...m } : x));
  const rubriques = useMemo(() => (e ? RUBRIQUES_OVYO.filter((r) => r.profils.includes(e.type === "agence" ? "entreprise" : e.type) || e.rubriques.includes(r.id)) : []), [e]);

  async function terminer() {
    if (!e) return;
    setBusy(true); setError("");
    const r = await fetch("/api/espace", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: e.nom, type: e.type, logo: e.logo, couleur: e.couleur,
        profil: { secteur: e.secteur, pays: e.pays, ville: e.ville, site: e.site, description: e.description, style: e.style, police: e.police, couleur2: e.couleur2, ton: e.ton, rubriques: e.rubriques, configure: true },
      }),
    }).catch(() => null);
    if (!r?.ok) { setBusy(false); setError("Enregistrement impossible. Réessayez."); return; }
    window.location.href = "/";
  }

  if (!e) return <div className="obv"><p className="obv-attente">{error || "Préparation de votre espace…"}</p></div>;
  const dernier = etape === ETAPES.length - 1;

  return (
    <div className="obv">
      <link rel="stylesheet" href={FONTS_URL} />
      <header className="obv-tete">
        <OvyoLogo taille={30} />
        <ol className="obv-etapes" aria-label="Étapes">
          {ETAPES.map((n, i) => <li key={n} aria-current={i === etape ? "step" : undefined} data-fait={i < etape || undefined}>{i + 1}. {n}</li>)}
        </ol>
      </header>

      <main className="obv-corps">
        {etape === 0 && (
          <section className="obv-bloc">
            <h1>Parlez-nous de {e.nom || "votre organisation"}</h1>
            <p className="obv-sous">Ovyo choisit vos rubriques, vos sources et votre ton à partir de ces réponses.</p>
            <label className="obv-champ">Nom affiché sur vos visuels<input value={e.nom} onChange={(x) => maj({ nom: x.target.value })} /></label>
            <fieldset className="obv-choix">
              <legend>Vous êtes</legend>
              <div className="obv-grille">
                {PROFILS.map((p) => (
                  <button type="button" key={p.id} aria-pressed={e.type === p.id} onClick={() => maj({ type: p.id, secteur: "", rubriques: PAR_DEFAUT[p.id] })}>
                    <strong>{p.nom}</strong><span>{p.detail}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="obv-choix">
              <legend>Votre secteur</legend>
              <div className="obv-puces">
                {SECTEURS[e.type].map((s) => <button type="button" key={s} aria-pressed={e.secteur === s} onClick={() => maj({ secteur: s })}>{s}</button>)}
              </div>
            </fieldset>
            <div className="obv-deux">
              <label className="obv-champ">Pays<select value={e.pays} onChange={(x) => maj({ pays: x.target.value })}>{PAYS.map((p) => <option key={p}>{p}</option>)}</select></label>
              <label className="obv-champ">Ville<input value={e.ville} onChange={(x) => maj({ ville: x.target.value })} placeholder="Ex. : Ouagadougou" /></label>
            </div>
            <label className="obv-champ">Site web (facultatif)<input value={e.site} onChange={(x) => maj({ site: x.target.value })} placeholder="www.monsite.com" /></label>
            <label className="obv-champ">Ce que vous faites, en une phrase<textarea rows={2} value={e.description} onChange={(x) => maj({ description: x.target.value })} placeholder="Ex. : Radio d'information locale, en français et en mooré." /></label>
          </section>
        )}

        {etape === 1 && (
          <section className="obv-bloc">
            <h1>Votre identité visuelle</h1>
            <p className="obv-sous">Chaque visuel prendra votre logo, vos couleurs et votre police.</p>
            <ImageField label="Votre logo" hint="PNG avec fond transparent de préférence." value={e.logo} onChange={(url) => maj({ logo: url })} placeholder="https://…/logo.png" />
            <div className="obv-deux">
              <Couleur titre="Couleur principale" valeur={e.couleur} changer={(c) => maj({ couleur: c })} />
              <Couleur titre="Couleur secondaire" valeur={e.couleur2} changer={(c) => maj({ couleur2: c })} />
            </div>
            <fieldset className="obv-choix">
              <legend>Votre police</legend>
              <div className="obv-polices">
                {POLICES.map((p) => (
                  <button type="button" key={p} aria-pressed={e.police === p} onClick={() => maj({ police: p })} style={{ fontFamily: `'${p}', sans-serif` }}>
                    <span style={{ fontSize: 26, fontWeight: 800 }}>Aa</span><small>{p}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          </section>
        )}

        {etape === 2 && (
          <section className="obv-bloc">
            <h1>Choisissez votre style</h1>
            <p className="obv-sous">Il s&apos;applique à tous vos visuels. Vous pourrez en changer à tout moment.</p>
            <div className="obv-styles">
              {STYLES.map((s) => (
                <button type="button" key={s.id} aria-pressed={e.style === s.id} onClick={() => maj({ style: s.id })}>
                  <ApercuStyle style={s.id} e={e} />
                  <strong>{s.nom}</strong><span>{s.detail}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {etape === 3 && (
          <section className="obv-bloc">
            <h1>Vos rubriques</h1>
            <p className="obv-sous">Nous avons coché celles qui conviennent à votre profil. Ajoutez ou retirez ce que vous voulez.</p>
            {[false, true].map((jeu) => (
              <fieldset className="obv-choix" key={String(jeu)}>
                <legend>{jeu ? "Jeux avec vos abonnés" : "Publications"}</legend>
                <div className="obv-rubriques">
                  {rubriques.filter((r) => Boolean(r.jeu) === jeu).map((r) => {
                    const on = e.rubriques.includes(r.id);
                    return (
                      <label key={r.id} data-on={on || undefined}>
                        <input type="checkbox" checked={on} onChange={() => maj({ rubriques: on ? e.rubriques.filter((x) => x !== r.id) : [...e.rubriques, r.id] })} />
                        <span><strong>{r.nom}</strong><small>{r.description} · {r.rythme}{r.auto ? " · automatique" : ""}</small></span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <fieldset className="obv-choix">
              <legend>Le ton de vos textes</legend>
              <div className="obv-grille">
                {TONS.map((t) => <button type="button" key={t.id} aria-pressed={e.ton === t.id} onClick={() => maj({ ton: t.id })}><strong>{t.nom}</strong><span>{t.detail}</span></button>)}
              </div>
            </fieldset>
          </section>
        )}
        {error ? <p className="ova-err" role="alert">{error}</p> : null}
      </main>

      <footer className="obv-pied">
        {etape > 0 ? <button type="button" className="obv-retour" onClick={() => setEtape(etape - 1)}>Retour</button> : <span />}
        <button type="button" className="ova-go obv-suite" disabled={busy || (etape === 0 && !e.secteur)}
          onClick={() => (dernier ? terminer() : setEtape(etape + 1))}>
          {busy ? "Enregistrement…" : dernier ? "Terminer et ouvrir Ovyo" : etape === 0 && !e.secteur ? "Choisissez un secteur" : "Continuer"}
        </button>
      </footer>
    </div>
  );
}

function Couleur({ titre, valeur, changer }: { titre: string; valeur: string; changer: (c: string) => void }) {
  return (
    <fieldset className="obv-choix">
      <legend>{titre}</legend>
      <div className="obv-couleurs">
        {COULEURS.map((c) => <button type="button" key={c} aria-label={c} aria-pressed={valeur.toLowerCase() === c.toLowerCase()} style={{ background: c }} onClick={() => changer(c)} />)}
        <label className="obv-perso" aria-label="Autre couleur"><input type="color" value={valeur} onChange={(x) => changer(x.target.value)} />Autre</label>
      </div>
    </fieldset>
  );
}

// Aperçu miniature du visuel « Le chiffre du jour » dans chacun des 4 styles, aux couleurs du client.
function ApercuStyle({ style, e }: { style: Style; e: Etat }) {
  const c = e.couleur, f = `'${e.police}', sans-serif`;
  const logo = e.logo ? <img src={e.logo} alt="" style={{ height: 14, maxWidth: 60, objectFit: "contain" }} /> : <b style={{ fontSize: 9 }}>{(e.nom || "Marque").slice(0, 18)}</b>;
  const base: React.CSSProperties = { width: "100%", aspectRatio: "4 / 5", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: f, overflow: "hidden", borderRadius: 10 };
  if (style === "sobre") return (
    <span style={{ ...base, background: "#fff", color: "#18181B", padding: 12, border: "1px solid #E4E4E7" }}>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, borderBottom: "1px solid #E4E4E7" }}>{logo}<small style={{ fontSize: 7, color: "#71717A" }}>CHIFFRE DU JOUR</small></span>
      <span style={{ margin: "auto 0", fontSize: 36, fontWeight: 600, color: c, letterSpacing: -2, whiteSpace: "nowrap" }}>2 400</span>
      <span style={{ fontSize: 9, color: "#3F3F46" }}>Une phrase qui explique ce chiffre.</span>
    </span>
  );
  if (style === "moderne") return (
    <span style={{ ...base, background: "#F1F1F4", padding: 8, gap: 6 }}>
      <span style={{ background: "#fff", borderRadius: 8, padding: "5px 7px", display: "flex", alignItems: "center" }}>{logo}</span>
      <span style={{ flexGrow: 1, background: "#fff", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        <span style={{ alignSelf: "flex-start", background: c, color: "#fff", borderRadius: 10, padding: "3px 8px", fontSize: 28, fontWeight: 800, letterSpacing: -1.5, whiteSpace: "nowrap" }}>2 400</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#111" }}>Une phrase qui explique ce chiffre.</span>
      </span>
    </span>
  );
  if (style === "energique") return (
    <span style={{ ...base, background: c, color: "#fff" }}>
      <span style={{ background: e.couleur2, padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>{logo}<small style={{ fontSize: 7, fontWeight: 800, background: "#FDE047", color: "#111", padding: "1px 4px" }}>CHIFFRE</small></span>
      <span style={{ margin: "auto 10px 4px", fontSize: 36, fontWeight: 800, letterSpacing: -2, lineHeight: 0.9, whiteSpace: "nowrap" }}>2 400</span>
      <span style={{ margin: "0 10px 12px", fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>Une phrase qui explique ce chiffre.</span>
    </span>
  );
  return (
    <span style={{ ...base, background: "#F8F7F4", color: "#1C1917", fontFamily: "'Source Serif 4', serif" }}>
      <span style={{ height: 4, background: c }} />
      <span style={{ padding: "8px 0 6px", textAlign: "center", borderBottom: "1px solid #D6D3D1", display: "flex", justifyContent: "center" }}>{logo}</span>
      <span style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 6, padding: "0 10px" }}><span style={{ fontSize: 34, fontWeight: 800, color: c, whiteSpace: "nowrap" }}>2 400</span><span style={{ fontSize: 9 }}>Une phrase qui explique ce chiffre.</span></span>
      <span style={{ height: 14, background: "#1C1917" }} />
    </span>
  );
}
