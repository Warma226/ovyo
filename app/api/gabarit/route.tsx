import { ImageResponse } from "next/og";
import { lireGabarit } from "@/lib/gabarit-url";
import { rendreGabarit, W, H } from "@/lib/gabarit-rendu";
import { policeFonts } from "@/lib/fonts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Image (PNG, JPEG) chargée ici et passée en data URI ; sinon l'emplacement reste vide au lieu de faire échouer le visuel.
async function image(url?: string): Promise<string | undefined> {
  if (!url || !/^https?:\/\//.test(url)) return undefined;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Ovyo/1.0)" }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return undefined;
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const buf = Buffer.from(await res.arrayBuffer());
    if (!["image/jpeg", "image/jpg", "image/png"].includes(type) || buf.length > 6_000_000) return undefined;
    return `data:${type === "image/jpg" ? "image/jpeg" : type};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

// GET /api/gabarit?d=…&sig=… → visuel PNG 1080 × 1350 (lien signé par Ovyo)
export async function GET(req: Request) {
  const r = lireGabarit(new URL(req.url).searchParams);
  if (!r) return new Response("Lien de visuel invalide.", { status: 403 });
  const [logo, photo] = await Promise.all([image(r.m.logo), image(r.champs.photo)]);
  const rendu = { ...r, m: { ...r.m, logo }, champs: { ...r.champs, photo } };
  const fonts = [...(await policeFonts(r.m.police || "Plus Jakarta Sans")), ...(r.m.style === "institutionnel" ? await policeFonts("Source Serif 4") : [])];
  return new ImageResponse(rendreGabarit(rendu), {
    width: W, height: H,
    fonts: fonts.length ? fonts : undefined,
    headers: { "Cache-Control": "public, max-age=86400, immutable" },
  });
}
