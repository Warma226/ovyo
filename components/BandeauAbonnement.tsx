"use client";
// Bandeau discret en haut de l'app (administrateur) : jours d'essai restants, abonnement bientôt fini ou expiré.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarque } from "./useMarque";
import { useMoi } from "./Moi";

export function BandeauAbonnement() {
  const path = usePathname();
  const m = useMarque();
  const moi = useMoi();
  if (moi?.role !== "admin" || !m.statut || /^\/(acces|inscription|invitation|bienvenue|abonnement|cgu|confidentialite)/.test(path)) return null;
  const fin = m.statut === "actif" ? m.abonnement_fin : m.essai_fin;
  const jours = fin ? Math.ceil((new Date(fin).getTime() - Date.now()) / 864e5) : null;
  let texte = "";
  let alerte = false;
  if (m.statut === "essai") {
    if (jours !== null && jours <= 0) { texte = "Votre essai gratuit est terminé : les publications automatiques sont arrêtées."; alerte = true; }
    else texte = `Essai gratuit : ${jours} jour${(jours ?? 0) > 1 ? "s" : ""} restant${(jours ?? 0) > 1 ? "s" : ""}.`;
  } else if (m.statut === "actif" && jours !== null && jours <= 3) {
    if (jours <= 0) { texte = "Votre abonnement a expiré : les publications automatiques sont arrêtées."; alerte = true; }
    else texte = `Votre abonnement se termine dans ${jours} jour${jours > 1 ? "s" : ""}.`;
  } else if (m.statut === "suspendu" || m.statut === "resilie") { texte = "Votre espace est suspendu."; alerte = true; }
  if (!texte) return null;
  return (
    <div role="status" className="ov-bandeau" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 14px", padding: "10px 16px", fontSize: 14, fontWeight: 600, background: alerte ? "#FFF1EA" : "#EEF4FF", color: alerte ? "#9A3412" : "#1E3A8A", borderBottom: `1px solid ${alerte ? "#FED7C3" : "#DCE6FB"}` }}>
      <span style={{ flex: "1 1 220px" }}>{texte}</span>
      <Link href="/abonnement" className="btn small primary" style={{ textDecoration: "none" }}>{m.statut === "actif" ? "Renouveler" : "Choisir une formule"}</Link>
    </div>
  );
}
