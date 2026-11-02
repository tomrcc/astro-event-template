import type { APIRoute } from 'astro';
import { siteContent } from '../lib/site-content';

export const GET: APIRoute = async () =>
	new Response(await siteContent(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
