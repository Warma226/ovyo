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
  const [vue, setVue] = useState<"apercu" | "clients" | "paiements" | "journal">("apercu");

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

  const c = d?.chiffres;
  const NAV: [typeof vue, string, string][] = [
    ["apercu", "Vue d'ensemble", "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"],
    ["clients", "Clients", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"],
    ["paiements", "Paiements", "M2 7h20v12H2zM2 11h20M6 15h4"],
    ["journal", "Journal", "M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"],
  ];
  const clients = (
    <section className="adm-carte" aria-labelledby="t-clients">
      <div className="adm-carte-h">
        <h2 id="t-clients">Espaces clients</h2>
        <label style={{ flex: "0 1 280px" }}><span className="sr-only">Rechercher</span>
          <input className="adm-recherche" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client…" />
        </label>
      </div>
      <div role="tablist" aria-label="Filtrer" className="adm-filtres">
        {(["tous", "essai", "actif", "expire", "suspendu"] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={filtre === k} onClick={() => setFiltre(k)} className="pa-onglet">
            {k === "tous" ? `Tous · ${c?.espaces ?? 0}` : `${ETATS[k].label} · ${d?.espaces.filter((e) => e.etat === k).length ?? 0}`}
          </button>
        ))}
      </div>
      {!d ? <p className="adm-vide">Chargement…</p> : liste.length === 0 ? <p className="adm-vide">Aucun client pour l&apos;instant.</p> : (
        <div>
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
  );
  const paiements = (
    <section className="adm-carte" aria-labelledby="t-pay">
      <div className="adm-carte-h"><h2 id="t-pay">Derniers paiements</h2></div>
      {!d?.paiements.length ? <p className="adm-vide">Aucun paiement pour l&apos;instant.</p> : d.paiements.map((p, i) => (
        <div key={i} className="pa-mini"><span style={{ flex: 1, minWidth: 0 }}><strong>{p.espace ?? "Espace supprimé"}</strong><small>{date(p.created_at)} · {formuleNom(p.formule)}</small></span><strong>{p.montant ? `${Number(p.montant).toLocaleString("fr-FR")} ${p.devise === "XOF" || !p.devise ? "F" : p.devise}` : "—"}</strong></div>
      ))}
    </section>
  );
  const journal = (
    <section className="adm-carte" aria-labelledby="t-jour">
      <div className="adm-carte-h"><h2 id="t-jour">Actions récentes</h2></div>
      {!d?.journal.length ? <p className="adm-vide">Aucune action manuelle.</p> : d.journal.map((j, i) => (
        <div key={i} className="pa-mini"><span style={{ flex: 1, minWidth: 0 }}><strong>{j.espace ?? "—"}</strong><small>{date(j.created_at)} · {j.detail}</small></span></div>
      ))}
    </section>
  );

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-marque">
          <svg width="30" height="30" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="30" fill="#2563EB" /><circle cx="45" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" /><circle cx="75" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" /><circle cx="96" cy="26" r="8" fill="#FF6A1A" /></svg>
          <span><strong>Ovyo</strong><small>Administration</small></span>
        </div>
        <nav aria-label="Administration" className="adm-nav">
          {NAV.map(([k, label, ic]) => (
            <button key={k} type="button" aria-current={vue === k ? "page" : undefined} onClick={() => setVue(k)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ic} /></svg>{label}
            </button>
          ))}
        </nav>
        <Link href="/" className="adm-retour">← Mon espace</Link>
      </aside>

      <main className="adm-main">
        <header className="adm-top">
          <div><h1>{NAV.find((n) => n[0] === vue)?.[1]}</h1><span>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
          <button type="button" className="adm-actualiser" onClick={() => void charger()}>Actualiser</button>
        </header>
        {info ? <p className="notice vert" role="status">{info}</p> : null}
        {erreur ? <p className="notice rouge" role="alert">{erreur}</p> : null}

        {vue === "apercu" ? (
          <>
            <div className="pa-kpis">
              <Kpi titre="Revenus ce mois" valeur={c ? F(c.revenuMois) : "…"} detail={c ? `${F(c.revenuTotal)} au total` : ""} fort />
              <Kpi titre="Clients actifs" valeur={c ? String(c.actifs) : "…"} detail={c ? `${c.parFormule.essentiel} Essentiel · ${c.parFormule.pro} Pro` : ""} />
              <Kpi titre="En essai" valeur={c ? String(c.essai) : "…"} detail={c ? `${c.nouveaux30} inscrits sur 30 jours` : ""} />
              <Kpi titre="Expirés" valeur={c ? String(c.expires) : "…"} detail={c ? `${c.suspendus} suspendu${c.suspendus > 1 ? "s" : ""}` : ""} />
            </div>
            <div className="adm-deux">{paiements}{journal}</div>
          </>
        ) : vue === "clients" ? clients : vue === "paiements" ? paiements : journal}
      </main>
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
