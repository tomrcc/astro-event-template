import { getCollection } from 'astro:content';

// The Visual Editor's getCollection shim keeps `.md` on markdown entry ids; Astro's glob loader drops it.
export async function getSpeakers() {
	return (await getCollection('speakers')).map((entry) => ({ ...entry, id: entry.id.replace(/\.md$/, '') }));
}
