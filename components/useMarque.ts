"use client";
// Identité de l'espace client connecté, chargée une fois puis partagée par toutes les pages.
import { useEffect, useState } from "react";

export type MarqueClient = { nom: string; tag: string; site: string; logo: string | null; couleur: string; statut: string | null; essai_fin: string | null; configure?: boolean; rubriques?: string[]; type?: string | null };
const VIDE: MarqueClient = { nom: "", tag: "", site: "", logo: null, couleur: "#2563EB", statut: null, essai_fin: null };
let memo: MarqueClient | null = null;
let attente: Promise<MarqueClient> | null = null;

export function chargerMarque(): Promise<MarqueClient> {
  if (memo) return Promise.resolve(memo);
  attente ??= fetch("/api/marque").then((r) => (r.ok ? r.json() : VIDE)).catch(() => VIDE).then((m: MarqueClient) => (memo = { ...VIDE, ...m }));
  return attente;
}

export function useMarque(): MarqueClient {
  const [m, setM] = useState<MarqueClient>(memo ?? VIDE);
  useEffect(() => { let vivant = true; void chargerMarque().then((x) => { if (vivant) setM(x); }); return () => { vivant = false; }; }, []);
  return m;
}

// Lecture immédiate (hors composant React, ex. dessin sur canvas) : l'identité déjà chargée, sinon vide.
export function marqueSync(): MarqueClient { return memo ?? VIDE; }
if (typeof window !== "undefined" && !location.pathname.match(/^\/(acces|inscription|invitation|bienvenue)/)) void chargerMarque();
