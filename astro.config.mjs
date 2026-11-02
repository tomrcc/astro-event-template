// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';

export default defineConfig({
	site: 'https://example.com',
	adapter: netlify(),
	integrations: [editableRegions()],
	env: {
		schema: {
			ANTHROPIC_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			CHAT_MODEL: envField.string({ context: 'server', access: 'public', default: 'claude-haiku-5-5' }),
			ENQUIRY_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
			TICKETING_API_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
});
