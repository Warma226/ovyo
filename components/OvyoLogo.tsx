// Logo Ovyo (piste A « O·O ») : carré bleu, deux anneaux blancs, point orange.
export function OvyoSymbole({ taille = 40, fond = "#2563EB", point = "#FF6A1A" }: { taille?: number; fond?: string; point?: string }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 120 120" role="img" aria-label="Ovyo">
      <rect width="120" height="120" rx="30" fill={fond} />
      <circle cx="45" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" />
      <circle cx="75" cy="62" r="21" fill="none" stroke="#fff" strokeWidth="11" />
      <circle cx="96" cy="26" r="8" fill={point} />
    </svg>
  );
}
export function OvyoLogo({ taille = 36, couleur = "#0B1220" }: { taille?: number; couleur?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: taille * 0.28 }}>
      <OvyoSymbole taille={taille} />
      <span style={{ fontWeight: 800, fontSize: taille * 0.9, letterSpacing: -taille * 0.04, color: couleur, lineHeight: 1 }}>ovyo</span>
    </span>
  );
}
