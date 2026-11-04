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

`<ServerPreview note="…" />` marks a placeholder with a small icon that explains it to editors. It renders nothing outside the editor build, so it's safe to leave in production components. On the editor build it shows only inside the Visual Editor, not on CloudCannon's hosted copy.

The flag exists because the Visual Editor's preview answers server requests with a page of its own: without it, the editor's error page would be swapped in where the island goes.

Keep editor-owned pages prerendered. On-demand routes don't exist in the static build, so CloudCannon can't open them.

## Setup

Requires Node 22.23.4 or later (`.nvmrc` pins 24).

```sh
npm install
cp .env.example .env
npm run dev
```

Fill in `.env` to try the server features locally. Each one falls back quietly when its variable is empty (see [Environment variables](#environment-variables)).

## Deploy

Production runs on Netlify. CloudCannon builds a second, static copy from the same repository for editing. Both build from the same branch, so every save in CloudCannon commits and triggers a Netlify deploy. That's how editors publish.

1. Push the repository to GitHub.
2. Set up the [external services](#external-services) and note their URLs and keys.
3. Create a Netlify site from the repository. The adapter sets the publish directory and functions, so the build command `npm run build` is all it needs. Node comes from `.nvmrc`.
4. In Netlify's environment variables, add the [server variables](#environment-variables), then redeploy. They're read at runtime by the server functions, so if you limit a variable's scopes, include Functions.
5. Set `site` in `astro.config.mjs` to the Netlify URL or your custom domain.
6. Create a CloudCannon site from the same repository and branch. CloudCannon reads `.cloudcannon/initial-site-settings.json` when the site is created, which sets the build commands, `dist` as the output path, Node from `.nvmrc`, and `PUBLIC_EDITOR_BUILD=true`. On a site that already exists, set these in the site's build settings instead. Don't add the server variables to CloudCannon.
7. Update `.cloudcannon/README.md`, the guide editors see inside CloudCannon, with your site's name and details.
8. Run the [checks](#check-it-works).

### External services

- **Claude API key** (`ANTHROPIC_API_KEY`): create a key in the Claude Console. Set a spend limit on the workspace too, since the built-in rate limit is per server instance (see [Chat assistant](#chat-assistant)).
- **Enquiry webhook** (`ENQUIRY_WEBHOOK_URL`): any URL that accepts a JSON POST of `{ name, email, message }` and returns a 2xx status. Any other status shows an error on the form. In Zapier, start a Zap with the **Webhooks by Zapier** trigger and the **Catch Hook** event, then copy its URL. Make's **Custom webhook** works the same way.
- **Ticketing API** (`TICKETING_API_URL`): a URL that returns `{ "seats_left": 42 }`. For testing, any public URL serving that JSON works, such as a raw GitHub Gist. For a real provider, adapt `src/lib/ticketing.ts` to its API. The island fetches on every request with no caching, so add caching if the provider rate-limits.

### Check it works

On the Netlify site:

- The Tickets section shows a seats-left number.
- The chat assistant answers a question about the event.
- A test enquiry reaches your webhook.

In CloudCannon's Visual Editor:

- Seats left, the chat assistant and the enquiry form each show a purple icon, and the chat and form don't send.

If something's missing on Netlify:

- **Chat shows the "unavailable" message:** `/api/chat` returned 503, so `ANTHROPIC_API_KEY` isn't reaching the function. Check its scopes and redeploy.
- **No seats-left line:** `TICKETING_API_URL` is unset, the request failed, or the response has no numeric `seats_left`.
- **Enquiry form shows an error:** `ENQUIRY_WEBHOOK_URL` is unset or the webhook returned a non-2xx status.

### Environment variables

Set these on the production host and in your local `.env`, never on CloudCannon (see `.env.example`):

- `ANTHROPIC_API_KEY`: turns on the chat assistant. Without it, `/api/chat` returns 503 and the widget shows the editor-owned "unavailable" message.
- `CHAT_MODEL`: defaults to `claude-haiku-5-5`.
- `ENQUIRY_WEBHOOK_URL`: the enquiry action POSTs `{ name, email, message }` as JSON here. Without it, production enquiries fail and dev logs them to the console.
- `TICKETING_API_URL`: should return `{ "seats_left": 42 }`. Without it, the island renders nothing.

CloudCannon's build sets only `PUBLIC_EDITOR_BUILD=true`.

### Other hosts

To use another adapter, swap `@astrojs/netlify` for it. CloudCannon's output path must match the adapter's static output: `dist` for Netlify, `.vercel/output/static` for Vercel, `dist/client` for Node.

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
