# Astro event template

A conference site for [CloudCannon](https://cloudcannon.com) that uses Astro's server features and stays fully editable in the Visual Editor.

- **Server island:** live seats left in the Tickets section (`server:defer`).
- **Streaming chat assistant:** answers from the site's own content using Claude (`/api/chat`).
- **Astro Action:** the enquiry form posts to a webhook.
- **`/llms.txt`:** the whole site as Markdown, built from editor content.

Production runs on a host with an adapter (Netlify here). CloudCannon builds a static copy for editing.

## How editing and server features fit together

CloudCannon builds the site with `PUBLIC_EDITOR_BUILD=true`. Read it through `src/lib/editor-build.ts`. On that build, each server-backed part renders a placeholder instead:

- The Tickets section renders `SeatsLeftView` with an example number instead of the `SeatsLeft` server island. Both use the same view component, so the placeholder matches the live markup.
- The chat assistant and enquiry form render, but don't send.

`<ServerPreview note="…" />` marks a placeholder with a small icon that explains it to editors. It renders nothing outside the editor build, so it's safe to leave in production components.

The flag exists because the Visual Editor's preview answers server requests with a page of its own: without it, the editor's error page would be swapped in where the island goes.

Keep editor-owned pages prerendered. On-demand routes don't exist in the static build, so CloudCannon can't open them.

## Setup

Requires Node 22.23.4 or later (`.nvmrc` pins 24).

```sh
npm install
npm run dev
```

### Production host

Set these on the production host only (see `.env.example`):

- `ANTHROPIC_API_KEY`: turns on the chat assistant. Without it, `/api/chat` returns 503 and the widget shows the editor-owned "unavailable" message.
- `CHAT_MODEL`: defaults to `claude-haiku-5-5`.
- `ENQUIRY_WEBHOOK_URL`: the enquiry action POSTs `{ name, email, message }` as JSON here, for example to a Zapier or Make webhook. Without it, production enquiries fail and dev logs them to the console.
- `TICKETING_API_URL`: should return `{ "seats_left": 42 }`. Adapt `src/lib/ticketing.ts` to your provider. Without it, the island renders nothing.

Set `site` in `astro.config.mjs` to the production URL.

To use another adapter, swap `@astrojs/netlify` for it. CloudCannon's output path must match the adapter's static output: `dist` for Netlify, `.vercel/output/static` for Vercel, `dist/client` for Node.

### CloudCannon

`.cloudcannon/initial-site-settings.json` sets the build and `PUBLIC_EDITOR_BUILD=true` when the site is created. For an existing site, add the variable in the site's build settings. Don't set the server variables there.

## Chat assistant

`src/pages/api/chat.ts` streams plain text from Claude. Its system prompt is the site content from `src/lib/site-content.ts` (the same text as `/llms.txt`) plus the editor-owned instructions in `src/data/chat.json`.

Built-in limits:

- 500 characters per message and the last 11 messages per request
- 1,024 output tokens and `low` effort per reply
- 20 requests per 10 minutes per IP, held in memory, so each server instance counts separately. Add your host's rate limiting for real traffic.

When you add a block type, add a case for it in `blockText` in `src/lib/site-content.ts` so the assistant knows about its content.

## Editable regions and editor-only code

- Blocks live in `src/components/blocks/`, each with a `*.cloudcannon.structure-value.yml` beside it, and are registered through `src/cloudcannon/componentMap.ts`.
- Registered components are re-rendered in the browser by `@cloudcannon/editable-regions`. Its `astro:env/server` stand-in only provides `getSecret`, so code a block imports must read secrets with `getSecret('NAME')`, not a named import (see `src/lib/ticketing.ts`).
- `ServerPreview` inlines its CSS and script so they only ship in the editor build.
