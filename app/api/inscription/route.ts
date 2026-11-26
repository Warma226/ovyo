import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession } from "@/lib/session";
import { appareilDe, contactPris, hacher, mdpValide, ouvrirSession } from "@/lib/equipe";
import { avecEspace } from "@/lib/espace";
import { dbBrut, db } from "@/lib/store";
import { ESSAI_JOURS, slugDe } from "@/lib/plateforme";

export const dynamic = "force-dynamic";

const TYPES = ["media", "entreprise", "agence", "institution"] as const;
type Corps = { organisation?: string; type?: string; nom?: string; contact?: string; password?: string };

// POST → crée l'espace client (essai gratuit), son administrateur, et ouvre la session.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Corps;
  const organisation = (b.organisation ?? "").trim().slice(0, 80);
  const nom = (b.nom ?? "").trim().slice(0, 60);
  const contact = (b.contact ?? "").trim().slice(0, 120);
  const type = TYPES.includes(b.type as (typeof TYPES)[number]) ? (b.type as string) : "media";
  const password = b.password ?? "";
  if (!process.env.APP_SECRET) return NextResponse.json({ error: "Ovyo n'est pas encore configuré." }, { status: 503 });
  if (organisation.length < 2) return NextResponse.json({ error: "Indiquez le nom de votre organisation." }, { status: 400 });
  if (nom.length < 2) return NextResponse.json({ error: "Indiquez votre nom." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[0-9 ]{8,16}$/.test(contact)) {
    return NextResponse.json({ error: "Indiquez un e-mail valide ou un numéro de téléphone." }, { status: 400 });
  }
  const err = mdpValide(password);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  if (await contactPris(contact)) return NextResponse.json({ error: "Ce contact a déjà un compte Ovyo. Connectez-vous." }, { status: 409 });

  // Adresse courte unique de l'espace (ex. « radio-horizon », « radio-horizon-2 »)
  const base = slugDe(organisation);
  const { data: pris } = await dbBrut().from("ov_espaces").select("slug").like("slug", `${base}%`);
  const existants = new Set((pris ?? []).map((x) => x.slug as string));
  let slug = base;
  for (let i = 2; existants.has(slug); i++) slug = `${base}-${i}`;

  const { data: espace, error: e1 } = await dbBrut().from("ov_espaces")
    .insert({ nom: organisation, slug, type, statut: "essai", formule: "essai", essai_fin: new Date(Date.now() + ESSAI_JOURS * 864e5).toISOString() })
    .select("id").single();
  if (e1 || !espace) return NextResponse.json({ error: "Création de l'espace impossible. Réessayez dans un instant." }, { status: 500 });
  const E = espace.id as string;

  const { data: membre, error: e2 } = await db(E).from("membres")
    .insert({ nom, contact, role: "admin", statut: "actif", mdp_hash: hacher(password) })
    .select("id").single();
  if (e2 || !membre) {
    await dbBrut().from("ov_espaces").delete().eq("id", E);
    const doublon = e2?.code === "23505";
    return NextResponse.json({ error: doublon ? "Ce contact a déjà un compte Ovyo. Connectez-vous." : "Création du compte impossible. Réessayez." }, { status: doublon ? 409 : 500 });
  }
  await dbBrut().from("ov_espaces").update({ proprietaire: membre.id }).eq("id", E);
  await db(E).from("settings").upsert({ id: 6, data: { nom } });

  const sid = await avecEspace(E, () => ouvrirSession(membre.id as string, appareilDe(req.headers.get("user-agent") ?? "")));
  const s = await createSession(membre.id as string, "admin", sid, E);
  const res = NextResponse.json({ ok: true, slug });
  res.cookies.set(SESSION_COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: s.maxAge });
  return res;
}
