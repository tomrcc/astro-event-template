// getSecret, not a named import: editable-regions bundles this for the editor, and its astro:env/server shim only has getSecret.
import { getSecret } from 'astro:env/server';

// Expects JSON like { "seats_left": 42 }. Adapt to your ticketing provider's API.
export async function getSeatsLeft(): Promise<number | null> {
	const url = getSecret('TICKETING_API_URL');
	if (!url) return null;
	try {
		const response = await fetch(url);
		if (!response.ok) return null;
		const { seats_left } = await response.json();
		return typeof seats_left === 'number' ? seats_left : null;
	} catch {
		return null;
	}
}
