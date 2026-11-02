import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'astro/zod';
import { ANTHROPIC_API_KEY, CHAT_MODEL } from 'astro:env/server';
import { siteContent } from '../../lib/site-content';
import { rateLimited } from '../../lib/rate-limit';
import chat from '../../data/chat.json';
import event from '../../data/event.json';

export const prerender = false;

const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 12;

const body = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
			}),
		)
		.min(1)
		.max(MAX_MESSAGES)
		.refine((messages) => messages[0].role === 'user' && messages.at(-1)?.role === 'user'),
});

let system: string | undefined;

async function systemPrompt() {
	system ??= `You are the assistant on the website for ${event.name}. Answer visitors' questions using only the site content below. If the answer isn't there, say you don't know and suggest the contact page. Keep answers to two or three sentences of plain text, with no Markdown.

${chat.instructions}

<site_content>
${await siteContent()}
</site_content>`;
	return system;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
	if (!ANTHROPIC_API_KEY) return new Response('Chat is not configured', { status: 503 });
	if (rateLimited(clientAddress, 20, 10 * 60 * 1000)) return new Response('Too many requests', { status: 429 });

	const parsed = body.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return new Response('Invalid request', { status: 400 });

	const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
	const stream = client.messages.stream({
		model: CHAT_MODEL,
		max_tokens: 1024,
		output_config: { effort: 'low' },
		system: [{ type: 'text', text: await systemPrompt(), cache_control: { type: 'ephemeral' } }],
		messages: parsed.data.messages,
	});

	const encoder = new TextEncoder();
	return new Response(
		new ReadableStream({
			async start(controller) {
				let sent = false;
				try {
					for await (const chunk of stream) {
						if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
							controller.enqueue(encoder.encode(chunk.delta.text));
							sent = true;
						}
					}
				} catch (error) {
					console.error('Chat stream failed', error);
				}
				if (!sent) controller.enqueue(encoder.encode(chat.unavailable_message));
				controller.close();
			},
			cancel() {
				stream.abort();
			},
		}),
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
	);
};
