// Lien signé vers le visuel d'un gabarit Ovyo : tout le contenu voyage dans le lien (d = JSON en base64url).
import { signParams, verifyParams, appUrl } from "./sign";
import type { Champs } from "./gabarits";
import type { MarqueRendu, Rendu } from "./gabarit-rendu";

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

export function gabaritUrl(rubrique: string, champs: Champs, m: MarqueRendu, absolute = false): string {
  const p = new URLSearchParams({ d: b64(JSON.stringify({ r: rubrique, c: champs, m })) });
  p.set("sig", signParams(p));
  return `${absolute ? appUrl() : ""}/api/gabarit?${p.toString()}`;
}

export function lireGabarit(params: URLSearchParams): Rendu | null {
  if (!verifyParams(params)) return null;
  try {
    const o = JSON.parse(Buffer.from(params.get("d") ?? "", "base64url").toString("utf8")) as { r: string; c: Champs; m: MarqueRendu };
    return { rubrique: o.r, champs: o.c ?? {}, m: o.m };
  } catch {
    return null;
  }
}
