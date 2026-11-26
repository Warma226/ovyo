// Rendu des gabarits Ovyo (1080 × 1350) : 7 familles × 4 styles, aux couleurs, au logo et à la police du client.
// Écrit pour le moteur de rendu des visuels (Satori) : chaque bloc qui contient plusieurs éléments est en display: flex.
import type { Champs, Famille } from "./gabarits";
import { GABARITS } from "./gabarits";

export type StyleId = "sobre" | "moderne" | "energique" | "institutionnel";
export type MarqueRendu = { nom: string; logo?: string; site?: string; couleur: string; couleur2: string; police: string; style: StyleId };
export type Rendu = { rubrique: string; champs: Champs; m: MarqueRendu };

export const W = 1080, H = 1350;
const SERIF = "Source Serif 4";

type Tok = { bg: string; fg: string; muted: string; line: string; card: string | null; radius: number; titre: number; upper: boolean; accent: string; surAccent: string; centre: boolean; fTitre: string };

function tokens(m: MarqueRendu): Tok {
  const c = m.couleur;
  switch (m.style) {
    case "sobre": return { bg: "#FFFFFF", fg: "#18181B", muted: "#71717A", line: "#E4E4E7", card: null, radius: 8, titre: 700, upper: false, accent: c, surAccent: "#FFFFFF", centre: false, fTitre: m.police };
    case "energique": return { bg: c, fg: "#FFFFFF", muted: "rgba(255,255,255,0.85)", line: "rgba(255,255,255,0.35)", card: "rgba(0,0,0,0.2)", radius: 0, titre: 800, upper: true, accent: "#FDE047", surAccent: "#111114", centre: false, fTitre: m.police };
    case "institutionnel": return { bg: "#F8F7F4", fg: "#1C1917", muted: "#78716C", line: "#D6D3D1", card: null, radius: 6, titre: 700, upper: false, accent: c, surAccent: "#FFFFFF", centre: true, fTitre: SERIF };
    default: return { bg: "#F1F1F4", fg: "#111114", muted: "#6B7280", line: "#E5E7EB", card: "#FFFFFF", radius: 44, titre: 800, upper: false, accent: c, surAccent: "#FFFFFF", centre: false, fTitre: m.police };
  }
}

const taille = (t: string, paliers: [number, number][]) => { for (const [n, s] of paliers) if (t.length <= n) return s; return paliers[paliers.length - 1][1]; };
const initiales = (nom: string) => nom.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase() || "O";
const maj = (t: string, k: Tok) => (k.upper ? t.toUpperCase() : t);

function Logo({ m, fond, texte }: { m: MarqueRendu; fond: string; texte: string }) {
  if (m.logo) return <img src={m.logo} alt="" height={72} style={{ height: 72, maxWidth: 260, objectFit: "contain" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", width: 68, height: 68, borderRadius: 18, background: fond, color: texte, alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>{initiales(m.nom)}</div>
      <span style={{ fontSize: 32, fontWeight: 800 }}>{m.nom.slice(0, 26)}</span>
    </div>
  );
}

function Entete({ m, k, tag }: { m: MarqueRendu; k: Tok; tag: string }) {
  if (m.style === "energique") return (
    <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", height: 132, background: m.couleur2, color: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", paddingLeft: 56 }}><Logo m={m} fond={m.couleur} texte="#FFFFFF" /></div>
      <div style={{ display: "flex", alignItems: "center", padding: "0 44px", background: "#FDE047", color: "#111114", fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>{tag}</div>
    </div>
  );
  if (m.style === "institutionnel") return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", height: 16, background: m.couleur }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "40px 0 30px", borderBottom: `2px solid ${k.line}` }}>
        <Logo m={m} fond={m.couleur} texte="#FFFFFF" />
        <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 6, color: k.muted }}>{tag}</span>
      </div>
    </div>
  );
  if (m.style === "moderne") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "48px 48px 0", padding: "24px 28px", borderRadius: 36, background: "#FFFFFF" }}>
      <Logo m={m} fond={m.couleur} texte="#FFFFFF" />
      <span style={{ display: "flex", padding: "12px 24px", borderRadius: 999, background: m.couleur, color: "#FFFFFF", fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{tag}</span>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "80px 88px 0", paddingBottom: 32, borderBottom: `2px solid ${k.line}` }}>
      <Logo m={m} fond={m.couleur} texte="#FFFFFF" />
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 3, color: k.muted }}>{tag}</span>
    </div>
  );
}

function Pied({ m, k, gauche }: { m: MarqueRendu; k: Tok; gauche?: string }) {
  const site = (m.site ?? "").replace(/^https?:\/\//, "");
  if (m.style === "institutionnel") return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "30px 80px", background: "#1C1917", color: "#D6D3D1", fontSize: 24 }}>
      <span>{gauche ?? ""}</span><span>{site}</span>
    </div>
  );
  if (m.style === "moderne") return (
    <div style={{ display: "flex", justifyContent: "space-between", margin: "0 48px 48px", padding: "26px 32px", borderRadius: 36, background: "#FFFFFF", color: k.muted, fontSize: 24, fontWeight: 600 }}>
      <span>{gauche ?? ""}</span><span>{site}</span>
    </div>
  );
  return (
    <div style={{ display: "flex", justifyContent: "space-between", margin: m.style === "sobre" ? "0 88px 80px" : "0 56px 52px", paddingTop: m.style === "sobre" ? 30 : 0, borderTop: m.style === "sobre" ? `2px solid ${k.line}` : "0px solid transparent", color: k.muted, fontSize: 24, fontWeight: 600 }}>
      <span>{gauche ?? ""}</span><span>{site}</span>
    </div>
  );
}

// Zone centrale : carte blanche pour « moderne », marges pour les autres.
function Centre({ m, k, children }: { m: MarqueRendu; k: Tok; children: React.ReactNode }) {
  const carte = m.style === "moderne";
  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 36, margin: carte ? "24px 48px" : m.style === "energique" ? "0 56px" : "0 88px", padding: carte ? 64 : "40px 0", borderRadius: carte ? k.radius : 0, background: carte ? "#FFFFFF" : "transparent", alignItems: k.centre ? "center" : "stretch", textAlign: k.centre ? "center" : "left" }}>
      {children}
    </div>
  );
}

function Chiffre({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const c = r.champs.chiffre ?? "";
  const s = taille(c, [[4, 300], [6, 240], [9, 180], [99, 140]]);
  return (
    <Centre m={m} k={k}>
      {r.champs.titre ? <span style={{ fontFamily: k.fTitre, fontSize: 48, fontWeight: k.titre, color: m.style === "energique" ? "#FDE047" : k.accent }}>{maj(r.champs.titre, k)}</span> : null}
      {m.style === "moderne"
        ? <span style={{ display: "flex", alignSelf: "flex-start", padding: "16px 44px", borderRadius: 48, background: m.couleur, color: "#FFFFFF", fontSize: s * 0.8, fontWeight: 800, letterSpacing: -s * 0.04, lineHeight: 1 }}>{c}</span>
        : <span style={{ fontFamily: k.fTitre, fontSize: s, fontWeight: k.titre, letterSpacing: -s * 0.04, lineHeight: 0.92, color: m.style === "energique" ? "#FFFFFF" : k.accent }}>{c}</span>}
      <div style={{ display: "flex", width: m.style === "institutionnel" ? 260 : 140, height: m.style === "energique" ? 20 : 4, background: m.style === "energique" ? "#FDE047" : m.style === "institutionnel" ? k.line : k.fg }} />
      <span style={{ fontFamily: m.style === "institutionnel" ? SERIF : m.police, fontSize: taille(r.champs.texte ?? "", [[80, 54], [140, 46], [999, 40]]), fontWeight: m.style === "sobre" ? 600 : 700, lineHeight: 1.3, color: k.fg }}>{maj(r.champs.texte ?? "", k)}</span>
    </Centre>
  );
}

function Liste({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const items = (r.champs.items ?? []).filter(Boolean).slice(0, 5);
  const fs = items.length > 4 ? 40 : 46;
  return (
    <Centre m={m} k={k}>
      {r.champs.titre ? <span style={{ fontFamily: k.fTitre, fontSize: taille(r.champs.titre, [[40, 80], [70, 64], [999, 54]]), fontWeight: k.titre, lineHeight: 1.08, letterSpacing: -1.5, color: k.fg }}>{maj(r.champs.titre, k)}</span> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: m.style === "moderne" ? 18 : 0, width: "100%" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 32, padding: m.style === "moderne" ? "26px 30px" : "28px 0", borderRadius: m.style === "moderne" ? 28 : 0, background: m.style === "moderne" ? "#F4F4F6" : "transparent", borderBottom: m.style === "moderne" || i === items.length - 1 ? "0px solid transparent" : `2px solid ${k.line}`, textAlign: "left" }}>
            <span style={{ display: "flex", flexShrink: 0, width: 76, height: 76, borderRadius: m.style === "institutionnel" ? 38 : m.style === "energique" ? 0 : 20, background: m.style === "sobre" ? "transparent" : k.accent, color: m.style === "sobre" ? k.accent : k.surAccent, alignItems: "center", justifyContent: "center", fontFamily: k.fTitre, fontSize: m.style === "sobre" ? 56 : 38, fontWeight: 800 }}>{String(i + 1)}</span>
            <span style={{ fontSize: fs, fontWeight: 700, lineHeight: 1.2, color: k.fg }}>{maj(it, k)}</span>
          </div>
        ))}
      </div>
    </Centre>
  );
}

function Titre({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const photo = r.champs.photo;
  const t = r.champs.titre ?? "";
  const fs = taille(t, photo ? [[40, 76], [70, 64], [999, 54]] : [[40, 104], [80, 84], [130, 68], [999, 58]]);
  return (
    <Centre m={m} k={k}>
      {photo ? <img src={photo} alt="" width={m.style === "moderne" ? 840 : 904} height={440} style={{ width: "100%", height: 440, objectFit: "cover", borderRadius: Math.min(k.radius, 32) }} /> : null}
      <span style={{ fontFamily: k.fTitre, fontSize: fs, fontWeight: k.titre, lineHeight: 1.08, letterSpacing: -fs * 0.025, color: k.fg }}>{maj(t, k)}</span>
      {r.champs.texte ? <span style={{ fontSize: taille(r.champs.texte, [[120, 40], [220, 34], [999, 30]]), fontWeight: 500, lineHeight: 1.45, color: m.style === "energique" ? "rgba(255,255,255,0.9)" : "#3F3F46" }}>{r.champs.texte}</span> : null}
      {r.champs.infos ? <span style={{ display: "flex", alignSelf: k.centre ? "center" : "flex-start", padding: "16px 28px", borderRadius: m.style === "energique" ? 0 : 20, background: k.accent, color: k.surAccent, fontSize: 32, fontWeight: 800 }}>{r.champs.infos}</span> : null}
    </Centre>
  );
}

function Question({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const choix = (r.champs.choix ?? []).filter(Boolean).slice(0, 3);
  const t = r.champs.titre ?? "";
  return (
    <Centre m={m} k={k}>
      <span style={{ fontFamily: k.fTitre, fontSize: taille(t, [[50, 92], [90, 76], [999, 62]]), fontWeight: k.titre, lineHeight: 1.08, letterSpacing: -1.5, color: k.fg }}>{maj(t, k)}</span>
      {choix.length === 2 ? (
        <div style={{ display: "flex", gap: 28, width: "100%" }}>
          {choix.map((c, i) => <div key={i} style={{ display: "flex", flexGrow: 1, flexBasis: 0, height: 220, borderRadius: Math.min(k.radius, 40), background: i === 0 ? k.accent : m.style === "energique" ? "#111114" : k.fg, color: i === 0 ? k.surAccent : "#FFFFFF", alignItems: "center", justifyContent: "center", fontSize: taille(c, [[4, 96], [10, 64], [99, 44]]), fontWeight: 800 }}>{c.toUpperCase()}</div>)}
        </div>
      ) : choix.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          {choix.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "26px 30px", borderRadius: Math.min(k.radius, 32), border: `4px solid ${m.style === "energique" ? "rgba(255,255,255,0.4)" : k.line}`, background: m.style === "energique" ? "rgba(0,0,0,0.15)" : "#FFFFFF", textAlign: "left" }}>
              <span style={{ display: "flex", width: 72, height: 72, borderRadius: 18, background: k.accent, color: k.surAccent, alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800 }}>{"ABC"[i]}</span>
              <span style={{ fontSize: 42, fontWeight: 700, color: k.fg }}>{c}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", width: "100%", height: 150, borderRadius: Math.min(k.radius, 36), border: `6px dashed ${k.accent}`, background: m.style === "energique" ? "rgba(0,0,0,0.15)" : "#FFFFFF", alignItems: "center", padding: "0 40px", color: k.muted, fontSize: 38, fontWeight: 600 }}>votre réponse en commentaire</div>
      )}
    </Centre>
  );
}

function Citation({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const t = r.champs.texte ?? "";
  return (
    <Centre m={m} k={k}>
      {r.champs.photo ? <img src={r.champs.photo} alt="" width={200} height={200} style={{ width: 200, height: 200, borderRadius: 100, objectFit: "cover", border: `8px solid ${k.accent}` }} /> : null}
      <span style={{ fontFamily: k.fTitre, fontSize: 220, fontWeight: 800, lineHeight: 0.6, color: k.accent, height: 110 }}>“</span>
      <span style={{ fontFamily: k.fTitre, fontSize: taille(t, [[90, 64], [160, 54], [999, 46]]), fontWeight: k.titre, lineHeight: 1.22, letterSpacing: -0.8, color: k.fg }}>{t}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: k.centre ? "center" : "flex-start" }}>
        <div style={{ display: "flex", width: 96, height: 8, borderRadius: 4, background: k.accent, marginBottom: 12 }} />
        <span style={{ fontSize: 42, fontWeight: 800, color: k.fg }}>{r.champs.auteur ?? ""}</span>
        <span style={{ fontSize: 30, fontWeight: 500, color: k.muted }}>{r.champs.fonction ?? ""}</span>
      </div>
    </Centre>
  );
}

function Alerte({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const items = (r.champs.items ?? []).filter(Boolean).slice(0, 3);
  const orange = "#EA580C";
  return (
    <Centre m={m} k={k}>
      <div style={{ display: "flex", alignSelf: k.centre ? "center" : "flex-start", padding: "14px 28px", background: orange, color: "#FFFFFF", fontSize: 30, fontWeight: 800, letterSpacing: 3, borderRadius: m.style === "energique" ? 0 : 12 }}>ATTENTION</div>
      <span style={{ fontFamily: k.fTitre, fontSize: taille(r.champs.titre ?? "", [[60, 76], [100, 64], [999, 54]]), fontWeight: k.titre, lineHeight: 1.1, color: k.fg }}>{r.champs.titre ?? ""}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 28px", borderRadius: Math.min(k.radius, 24), background: m.style === "energique" ? "rgba(0,0,0,0.18)" : "#FFF7ED", textAlign: "left" }}>
            <span style={{ display: "flex", width: 56, height: 56, borderRadius: 28, background: orange, color: "#FFFFFF", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, flexShrink: 0 }}>!</span>
            <span style={{ fontSize: 38, fontWeight: 700, color: m.style === "energique" ? "#FFFFFF" : "#431407" }}>{it}</span>
          </div>
        ))}
      </div>
      {r.champs.infos ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "28px 32px", borderRadius: Math.min(k.radius, 24), background: m.style === "energique" ? "#111114" : m.couleur, color: "#FFFFFF" }}><span style={{ fontSize: 28, fontWeight: 600 }}>Seul numéro officiel</span><span style={{ fontSize: 40, fontWeight: 800 }}>{r.champs.infos}</span></div> : null}
    </Centre>
  );
}

function VraiFaux({ r, m, k }: { r: Rendu; m: MarqueRendu; k: Tok }) {
  const v = (r.champs.verdict ?? "FAUX").toUpperCase().startsWith("V") ? "VRAI" : "FAUX";
  return (
    <Centre m={m} k={k}>
      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: k.muted }}>ON ENTEND SOUVENT…</span>
      <span style={{ fontFamily: k.fTitre, fontSize: taille(r.champs.titre ?? "", [[60, 76], [100, 64], [999, 54]]), fontWeight: k.titre, lineHeight: 1.12, color: k.fg }}>{r.champs.titre ?? ""}</span>
      <span style={{ display: "flex", alignSelf: k.centre ? "center" : "flex-start", padding: "18px 48px", borderRadius: m.style === "energique" ? 0 : 20, background: v === "VRAI" ? "#16A34A" : m.style === "energique" ? "#FDE047" : "#DC2626", color: v === "FAUX" && m.style === "energique" ? "#111114" : "#FFFFFF", fontSize: 64, fontWeight: 800, letterSpacing: 4 }}>{v}</span>
      <span style={{ fontSize: taille(r.champs.texte ?? "", [[120, 42], [999, 36]]), fontWeight: 600, lineHeight: 1.45, color: k.fg }}>{r.champs.texte ?? ""}</span>
    </Centre>
  );
}

const FAMILLES: Record<Famille, (p: { r: Rendu; m: MarqueRendu; k: Tok }) => React.ReactElement> = { chiffre: Chiffre, liste: Liste, titre: Titre, question: Question, citation: Citation, alerte: Alerte, vraifaux: VraiFaux };

export function rendreGabarit(r: Rendu) {
  const g = GABARITS[r.rubrique] ?? GABARITS.urgent;
  const m = r.m;
  const k = tokens(m);
  const Corps = FAMILLES[g.famille];
  const pied = r.champs.source ?? (g.famille === "question" ? (r.champs.infos ? `Répondez en commentaire · ${r.champs.infos}` : "Répondez en commentaire") : g.famille === "liste" && r.champs.infos ? r.champs.infos : undefined);
  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: k.bg, color: k.fg, fontFamily: m.police }}>
      <Entete m={m} k={k} tag={(r.champs.tag || g.tag).toUpperCase()} />
      <Corps r={r} m={m} k={k} />
      <Pied m={m} k={k} gauche={pied} />
    </div>
  );
}
