# GeneLM Evo2 frontend

Next.js 16 / React 19 application deployed to Cloudflare Workers with the
OpenNext adapter.

```bash
npm ci
npm run dev
```

Main checks:

```bash
npm run check
npm run build
npm run build:cloudflare
```

Production inference is proxied through `/api/analyze-variant`. Copy
the variable names from `.dev.vars.example` into an ignored `.env.local` file
for local testing; configure the same values as Cloudflare Worker secrets in
production. Never expose Modal credentials through `NEXT_PUBLIC_` variables.

See the bilingual [repository-level README](../README.md) for the live project,
Nature paper attribution, scientific contract, security model, and Modal
deployment instructions.
