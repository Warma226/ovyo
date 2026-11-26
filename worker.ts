// Point d'entrée Cloudflare : le site (OpenNext) + les tâches planifiées d'Ovyo (Cron Triggers).
// Les tâches appellent les routes /api/cron… avec CRON_SECRET (secret Cloudflare), pour chaque espace client.
// @ts-ignore : fichier généré à la construction
import { default as handler } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; APP_URL?: string };
type Ctx = { waitUntil(p: Promise<unknown>): void };

const TACHES: Record<string, string[]> = {
  "*/20 * * * *": ["/api/cron-rubriques"], // rubriques automatiques (essentiel, chiffre, quiz…)
  "*/15 * * * *": ["/api/cron"], // veille + publication des posts programmés
};

export default {
  fetch: handler.fetch,
  async scheduled(event: { cron: string }, env: Env, ctx: Ctx) {
    if (!env.CRON_SECRET) return;
    const base = (env.APP_URL || "https://ovyo.warmachinertech.workers.dev").replace(/\/$/, "");
    for (const chemin of TACHES[event.cron] ?? []) {
      const req = new Request(`${base}${chemin}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } });
      ctx.waitUntil(Promise.resolve(handler.fetch(req, env, ctx)).then(async (r: Response) => console.log(`cron ${chemin} → ${r.status} ${(await r.text()).slice(0, 300)}`)).catch((e: Error) => console.error(`cron ${chemin}`, e)));
    }
  },
};
