import { NextResponse } from "next/server";
import { aiJson, aiConfigured } from "@/lib/claude";
import "@/lib/marque";
import { GABARITS, type Champs } from "@/lib/gabarits";
import { gabaritUrl } from "@/lib/gabarit-url";
import { marqueRendu } from "@/lib/marque";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST { rubrique, idee?, champs? } → { champs, texte, image }
// Avec « idee », l'IA remplit les champs du gabarit et écrit le texte du post ; sans, on renvoie seulement l'aperçu.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { rubrique?: string; idee?: string; champs?: Champs };
  const g = b.rubrique ? GABARITS[b.rubrique] : undefined;
  if (!g || !b.rubrique) return NextResponse.json({ error: "Rubrique inconnue." }, { status: 400 });
  let champs: Champs = b.champs ?? {};
  let texte = "";
  if (b.idee?.trim()) {
    if (!aiConfigured()) return NextResponse.json({ error: "La rédaction par l'IA n'est pas encore activée sur Ovyo." }, { status: 503 });
    const schema = g.champs.map((c) => `"${c.id}": ${c.n ? `liste de ${c.n} textes (${c.max ?? 60} caractères max chacun)` : `texte (${c.max ?? 120} caractères max)`} : ${c.label}`).join("\n");
    try {
      const r = await aiJson<{ champs?: Champs; texte?: string }>(
        `Tu prépares les publications de {{IDENTITE}}\nRubrique : ${g.tag}. ${g.consigne}\nRègles : français professionnel, phrases courtes, aucune invention de chiffre, de citation ou de fait. Si une information manque, écris [À COMPLÉTER].`,
        `Idée ou contenu de départ :\n${b.idee.trim().slice(0, 4000)}\n\nRéponds en JSON : {"champs": {\n${schema}\n}, "texte": "le texte du post pour Facebook et LinkedIn, 2 à 5 phrases, avec 2 ou 3 hashtags dont #{{TAG}}"}`,
        1500,
      );
      champs = { ...champs, ...(r.champs ?? {}) };
      texte = r.texte ?? "";
    } catch (e) {
      return NextResponse.json({ error: `L'IA n'a pas pu répondre : ${(e as Error).message}` }, { status: 502 });
    }
  }
  return NextResponse.json({ champs, texte, image: gabaritUrl(b.rubrique, champs, await marqueRendu()) });
}
