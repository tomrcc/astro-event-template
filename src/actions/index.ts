import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { ENQUIRY_WEBHOOK_URL } from 'astro:env/server';

export const server = {
	enquire: defineAction({
		accept: 'form',
		input: z.object({
			name: z.string().min(1).max(200),
			email: z.email(),
			message: z.string().min(1).max(2000),
		}),
		handler: async (enquiry) => {
			if (!ENQUIRY_WEBHOOK_URL) {
				if (import.meta.env.DEV) return console.log('Enquiry (no ENQUIRY_WEBHOOK_URL set):', enquiry);
				throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Enquiries are not configured' });
			}
			const response = await fetch(ENQUIRY_WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(enquiry),
			});
			if (!response.ok) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Enquiry webhook failed' });
		},
	}),
};
