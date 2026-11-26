"use client";
// Atelier d'un gabarit Ovyo : champs du visuel, remplissage par l'IA, aperçu en direct aux couleurs du client.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GABARITS, nomRubrique, type ChampDef, type Champs } from "@/lib/gabarits";
import { RUBRIQUES_OVYO } from "@/lib/catalogue";
import { savePost } from "@/lib/client";
import { ImageField } from "@/components/ImageField";

export default function AtelierModele() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const g = GABARITS[id];
  const info = RUBRIQUES_OVYO.find((r) => r.id === id);
  const [champs, setChamps] = useState<Champs>({});
  const [idee, setIdee] = useState("");
  const [texte, setTexte] = useState("");
  const [image, setImage] = useState("");
  const [charge, setCharge] = useState(false);
  const [busy, setBusy] = useState<"" | "ia" | "save">("");
  const [error, setError] = useState("");
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aperçu : les champs vides montrent l'exemple du gabarit.
  const affiches: Champs = g ? { ...g.exemple, ...Object.fromEntries(Object.entries(champs).filter(([, v]) => (Array.isArray(v) ? v.some(Boolean) : Boolean(v)))) } : {};
  useEffect(() => {
    if (!g) return;
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(async () => {
      const r = await fetch("/api/gabarit-ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rubrique: id, champs: affiches }) }).catch(() => null);
      const d = r?.ok ? await r.json() : null;
      if (d?.image) { setCharge(true); setImage(d.image); }
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(affiches), id]);

  if (!g) return <div className="tv-page"><div className="tv-corps" style={{ paddingTop: 24 }}><p>Ce modèle n&apos;existe pas. <Link href="/creer">Retour</Link></p></div></div>;

  const maj = (k: keyof Champs, v: string | string[]) => setChamps((c) => ({ ...c, [k]: v }));

  async function remplir() {
    if (!idee.trim()) return setError("Écrivez d'abord une idée, un sujet ou collez un texte.");
    setBusy("ia"); setError("");
    const r = await fetch("/api/gabarit-ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rubrique: id, idee, champs }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy("");
    if (!r?.ok) return setError(d.error || "L'IA n'a pas pu répondre. Réessayez.");
    setChamps(d.champs ?? {}); if (d.texte) setTexte(d.texte);
  }

  async function enregistrer() {
    setBusy("save"); setError("");
    try {
      const final = affiches;
      const saved = await savePost({
        rubrique: id, idea: idee, title: final.titre || final.texte?.slice(0, 80) || nomRubrique(id),
        texts: { facebook: texte, linkedin: texte, tiktok: "", wp_title: final.titre ?? "", wp_body: texte, commun: texte },
        visual: { titre: final.titre ?? "", texte: final.texte ?? "", champs: final },
        platforms: ["facebook", "linkedin"], status: "brouillon",
      });
      router.push(`/editeur?id=${saved.id}`);
    } catch (e) {
      setBusy(""); setError((e as Error).message || "Enregistrement impossible.");
    }
  }

  return (
    <div className="tv-page">
      <div className="tv-corps" style={{ paddingTop: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          <Link href="/creer" className="tv-gris" style={{ textDecoration: "none", fontWeight: 600 }}>← Créer</Link>
          <h1 className="tv-titre">{nomRubrique(id)}</h1>
          <span style={{ fontSize: 15, color: "#33425C" }}>{info?.description}{info ? ` · ${info.rythme}` : ""}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: "999 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="tv-carte" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <strong style={{ fontSize: 16 }}>Partir d&apos;une idée</strong>
              <textarea rows={3} value={idee} onChange={(e) => setIdee(e.target.value)} placeholder="Un sujet, un lien d'article, des notes… L'IA remplit le visuel et écrit le post." style={{ border: "1.5px solid #E5E7EB", borderRadius: 14, padding: 12, font: "inherit", fontSize: 15 }} />
              <button type="button" className="btn primary" onClick={remplir} disabled={busy !== ""} style={{ alignSelf: "flex-start" }}>{busy === "ia" ? "L'IA prépare le post…" : "Remplir avec l'IA"}</button>
            </section>
            <section className="tv-carte" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <strong style={{ fontSize: 16 }}>Le visuel</strong>
              {g.champs.map((c) => <Champ key={c.id} c={c} champs={champs} exemple={g.exemple} maj={maj} />)}
            </section>
            <section className="tv-carte" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <strong style={{ fontSize: 16 }}>Le texte du post</strong>
              <textarea rows={5} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Le texte publié avec le visuel sur Facebook et LinkedIn." style={{ border: "1.5px solid #E5E7EB", borderRadius: 14, padding: 12, font: "inherit", fontSize: 15 }} />
            </section>
            {error ? <p className="notice rouge" role="alert">{error}</p> : null}
            <button type="button" className="btn primary" onClick={enregistrer} disabled={busy !== ""} style={{ height: 52, fontSize: 16 }}>{busy === "save" ? "Enregistrement…" : "Continuer : relire et programmer"}</button>
          </div>
          <aside style={{ flex: "1 1 320px", maxWidth: 440, position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 14, color: "#33425C" }}>Aperçu à vos couleurs</strong>
            <div style={{ aspectRatio: "4 / 5", borderRadius: 16, overflow: "hidden", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {image ? <img src={image} alt="Aperçu du visuel" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: charge ? 1 : 0.6 }} onLoad={() => setCharge(true)} /> : <span className="tv-gris">Préparation de l&apos;aperçu…</span>}
            </div>
            <span className="tv-gris" style={{ fontSize: 13 }}>Les champs vides affichent un exemple. Votre style et vos couleurs se règlent dans Compte.</span>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Champ({ c, champs, exemple, maj }: { c: ChampDef; champs: Champs; exemple: Champs; maj: (k: keyof Champs, v: string | string[]) => void }) {
  const style = { border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "10px 12px", font: "inherit", fontSize: 15 } as const;
  if (c.id === "photo") return <ImageField label={c.label} hint={c.aide} value={champs.photo ?? ""} onChange={(u) => maj("photo", u)} />;
  if (c.id === "items" || c.id === "choix") {
    const liste = (champs[c.id] ?? []) as string[];
    const ex = (exemple[c.id] ?? []) as string[];
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{c.label}</legend>
        {Array.from({ length: c.n ?? 3 }, (_, i) => (
          <input key={i} aria-label={`${c.label} ${i + 1}`} value={liste[i] ?? ""} maxLength={c.max} placeholder={ex[i] ?? ""} style={style}
            onChange={(e) => { const n = [...liste]; n[i] = e.target.value; maj(c.id as "items", n); }} />
        ))}
      </fieldset>
    );
  }
  const k = c.id as Exclude<keyof Champs, "items" | "choix">;
  const long = (c.max ?? 0) > 120;
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: "#374151" }}>{c.label}
      {long
        ? <textarea rows={3} value={champs[k] ?? ""} maxLength={c.max} placeholder={exemple[k] ?? ""} onChange={(e) => maj(k, e.target.value)} style={style} />
        : <input value={champs[k] ?? ""} maxLength={c.max} placeholder={exemple[k] ?? ""} onChange={(e) => maj(k, e.target.value)} style={style} />}
    </label>
  );
}
