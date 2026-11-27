"use client";
// Espace administrateur de la plateforme Ovyo : clients, abonnements, paiements et actions manuelles.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Espace = {
  id: string; nom: string; slug: string; type: string | null; statut: string; formule: string; etat: "essai" | "actif" | "expire" | "suspendu";
  essai_fin: string | null; abonnement_fin: string | null; fin: string | null; jours: number | null; created_at: string; logo: string | null; couleur: string | null;
  admin: { nom: string; contact: string } | null; membres: number; derniere_connexion: string | null; posts30: number; canaux: string[]; paye: number;
};
type Donnees = {
  chiffres: { espaces: number; essai: number; actifs: number; expires: number; suspendus: number; revenuMois: number; revenuTotal: number; nouveaux30: number; parFormule: { essentiel: number; pro: number } };
  espaces: Espace[];
  paiements: { espace: string | null; formule: string; montant: number | null; devise: string | null; created_at: string; fin: string | null }[];
  journal: { auteur: string; espace: string | null; action: string; detail: string; created_at: string }[];
};

const F = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—");
const ETATS: Record<Espace["etat"], { label: string; fond: string; texte: string }> = {
  essai: { label: "Essai", fond: "#EAF0FF", texte: "#1E40AF" },
  actif: { label: "Actif", fond: "#DDF3E8", texte: "#14613F" },
  expire: { label: "Expiré", fond: "#FDECE2", texte: "#9A3412" },
  suspendu: { label: "Suspendu", fond: "#EEEEF2", texte: "#4B4B57" },
};
const TYPES: Record<string, string> = { media: "Média", entreprise: "Entreprise", institution: "Institution / ONG", agence: "Agence" };

export default function Plateforme() {
  const [d, setD] = useState<Donnees | null>(null);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState<"tous" | Espace["etat"]>("tous");
  const [q, setQ] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  const charger = () => fetch("/api/plateforme", { cache: "no-store" }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setErreur(j.error || "Chargement impossible."); else setD(j);
  }).catch(() => setErreur("Chargement impossible."));
  useEffect(() => { void charger(); }, []);

  const liste = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (d?.espaces ?? []).filter((e) => (filtre === "tous" || e.etat === filtre) && (!t || [e.nom, e.slug, e.admin?.contact, e.admin?.nom].some((x) => x?.toLowerCase().includes(t))));
  }, [d, filtre, q]);

  async function agir(espace: string, action: string, extra: Record<string, unknown> = {}) {
    if (action === "suspendre" && !window.confirm("Suspendre cet espace ? Ses publications automatiques s'arrêtent.")) return;
    setInfo("");
    const r = await fetch("/api/plateforme", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ espace, action, ...extra }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErreur(j.error || "Action impossible.");
    setErreur(""); setInfo(j.detail ? `Fait : ${j.detail}.` : "Fait."); void charger();
  }

  if (erreur && !d) return <div className="tv-page"><div className="tv-corps" style={{ paddingTop: 24 }}><p className="notice rouge" role="alert">{erreur}</p><Link href="/">Retour</Link></div></div>;
  const c = d?.chiffres;

  return (
    <div className="tv-page">
      <div className="tv-corps" style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="tv-titre">Administration Ovyo</h1>
          <span style={{ fontSize: 15, color: "#33425C" }}>Tous vos clients, leurs abonnements et les paiements reçus.</span>
        </div>
        {info ? <p className="notice vert" role="status">{info}</p> : null}
        {erreur && d ? <p className="notice rouge" role="alert">{erreur}</p> : null}

        <div className="pa-kpis">
          <Kpi titre="Revenus ce mois" valeur={c ? F(c.revenuMois) : "…"} detail={c ? `${F(c.revenuTotal)} au total` : ""} fort />
          <Kpi titre="Clients actifs" valeur={c ? String(c.actifs) : "…"} detail={c ? `${c.parFormule.essentiel} Essentiel · ${c.parFormule.pro} Pro` : ""} />
          <Kpi titre="En essai" valeur={c ? String(c.essai) : "…"} detail={c ? `${c.nouveaux30} inscrits sur 30 jours` : ""} />
          <Kpi titre="Expirés" valeur={c ? String(c.expires) : "…"} detail={c ? `${c.suspendus} suspendu${c.suspendus > 1 ? "s" : ""}` : ""} />
        </div>

        <section className="tv-carte" aria-labelledby="t-clients" style={{ gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
            <h2 id="t-clients" className="tv-h2" style={{ margin: 0 }}>Espaces clients</h2>
            <label style={{ flex: "0 1 300px" }}><span className="sr-only">Rechercher</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, contact…" style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "10px 12px", font: "inherit", fontSize: 14 }} />
            </label>
          </div>
          <div role="tablist" aria-label="Filtrer" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["tous", "essai", "actif", "expire", "suspendu"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={filtre === k} onClick={() => setFiltre(k)} className="pa-onglet">
                {k === "tous" ? `Tous · ${c?.espaces ?? 0}` : `${ETATS[k].label} · ${d?.espaces.filter((e) => e.etat === k).length ?? 0}`}
              </button>
            ))}
          </div>

          {!d ? <p className="tv-gris">Chargement…</p> : liste.length === 0 ? <p className="tv-gris">Aucun espace.</p> : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {liste.map((e) => (
                <div key={e.id} className="pa-ligne">
                  <button type="button" className="pa-resume" aria-expanded={ouvert === e.id} onClick={() => setOuvert(ouvert === e.id ? null : e.id)}>
                    <span className="pa-av" style={{ background: e.couleur || "#2563EB" }}>{e.logo ? <img src={e.logo} alt="" /> : e.nom.slice(0, 2).toUpperCase()}</span>
                    <span style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                      <strong style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.nom}</strong>
                      <span style={{ fontSize: 12.5, color: "#5B6577" }}>{TYPES[e.type ?? ""] ?? "—"} · {e.admin?.contact ?? "sans administrateur"}</span>
                    </span>
                    <span className="pa-col"><span className="pa-pastille" style={{ background: ETATS[e.etat].fond, color: ETATS[e.etat].texte }}>{ETATS[e.etat].label}{e.etat === "actif" ? ` · ${formuleNom(e.formule)}` : ""}</span></span>
                    <span className="pa-col pa-masque">{e.jours === null ? "—" : e.jours > 0 ? `${e.jours} j restants` : `fini le ${date(e.fin)}`}</span>
                    <span className="pa-col pa-masque">{e.posts30} posts / 30 j</span>
                  </button>
                  {ouvert === e.id ? <Detail e={e} agir={agir} /> : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <section className="tv-carte" aria-labelledby="t-pay" style={{ flex: "1 1 380px", gap: 4 }}>
            <h2 id="t-pay" className="tv-h2" style={{ margin: "0 0 8px" }}>Derniers paiements</h2>
            {!d?.paiements.length ? <p className="tv-gris">Aucun paiement pour l&apos;instant.</p> : d.paiements.map((p, i) => (
              <div key={i} className="pa-mini"><span style={{ flex: 1, minWidth: 0 }}><strong>{p.espace ?? "Espace supprimé"}</strong><small>{date(p.created_at)} · {formuleNom(p.formule)}</small></span><strong>{p.montant ? `${Number(p.montant).toLocaleString("fr-FR")} ${p.devise === "XOF" || !p.devise ? "F" : p.devise}` : "—"}</strong></div>
            ))}
          </section>
          <section className="tv-carte" aria-labelledby="t-jour" style={{ flex: "1 1 380px", gap: 4 }}>
            <h2 id="t-jour" className="tv-h2" style={{ margin: "0 0 8px" }}>Actions récentes</h2>
            {!d?.journal.length ? <p className="tv-gris">Aucune action manuelle.</p> : d.journal.map((j, i) => (
              <div key={i} className="pa-mini"><span style={{ flex: 1, minWidth: 0 }}><strong>{j.espace ?? "—"}</strong><small>{date(j.created_at)} · {j.detail}</small></span></div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

const formuleNom = (f: string) => ({ essentiel: "Essentiel", pro: "Pro", agence: "Agence", essai: "Essai" } as Record<string, string>)[f] ?? f;

function Kpi({ titre, valeur, detail, fort }: { titre: string; valeur: string; detail: string; fort?: boolean }) {
  return (
    <div className="pa-kpi" style={fort ? { background: "#0B1B3F", color: "#FFFFFF", borderColor: "#0B1B3F" } : undefined}>
      <span style={{ fontSize: 13, opacity: 0.75 }}>{titre}</span>
      <strong style={{ fontFamily: "var(--font-mont), sans-serif", fontSize: 28, letterSpacing: "-0.02em" }}>{valeur}</strong>
      <span style={{ fontSize: 12.5, opacity: 0.7 }}>{detail}</span>
    </div>
  );
}

function Detail({ e, agir }: { e: Espace; agir: (espace: string, action: string, extra?: Record<string, unknown>) => Promise<void> }) {
  const [formule, setFormule] = useState(e.formule === "pro" ? "pro" : "essentiel");
  const [jours, setJours] = useState(30);
  return (
    <div className="pa-detail">
      <dl className="pa-dl">
        <div><dt>Administrateur</dt><dd>{e.admin ? `${e.admin.nom} · ${e.admin.contact}` : "—"}</dd></div>
        <div><dt>Membres</dt><dd>{e.membres}</dd></div>
        <div><dt>Inscrit le</dt><dd>{date(e.created_at)}</dd></div>
        <div><dt>Dernière connexion</dt><dd>{date(e.derniere_connexion)}</dd></div>
        <div><dt>Fin de l&apos;essai</dt><dd>{date(e.essai_fin)}</dd></div>
        <div><dt>Fin de l&apos;abonnement</dt><dd>{date(e.abonnement_fin)}</dd></div>
        <div><dt>Comptes reliés</dt><dd>{e.canaux.length ? e.canaux.join(", ") : "aucun"}</dd></div>
        <div><dt>Total payé</dt><dd>{F(e.paye)}</dd></div>
      </dl>
      <div className="pa-actions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <label className="sr-only" htmlFor={`f-${e.id}`}>Formule</label>
          <select id={`f-${e.id}`} value={formule} onChange={(x) => setFormule(x.target.value)} className="pa-champ"><option value="essentiel">Essentiel</option><option value="pro">Pro</option></select>
          <label className="sr-only" htmlFor={`j-${e.id}`}>Jours</label>
          <select id={`j-${e.id}`} value={jours} onChange={(x) => setJours(Number(x.target.value))} className="pa-champ"><option value={7}>7 jours</option><option value={30}>30 jours</option><option value={90}>90 jours</option><option value={365}>1 an</option></select>
          <button type="button" className="btn primary small" onClick={() => agir(e.id, "prolonger", { formule, jours })}>Activer / prolonger</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="btn small" onClick={() => agir(e.id, "essai", { jours: 7 })}>Essai +7 jours</button>
          {e.etat === "suspendu"
            ? <button type="button" className="btn small" onClick={() => agir(e.id, "reactiver")}>Réactiver</button>
            : <button type="button" className="btn small" style={{ color: "#B42318" }} onClick={() => agir(e.id, "suspendre")}>Suspendre</button>}
        </div>
        <span className="tv-gris" style={{ fontSize: 12.5 }}>« Activer / prolonger » sert aux paiements reçus hors de Chariow (espèces, virement) ou à un geste commercial.</span>
      </div>
    </div>
  );
}
