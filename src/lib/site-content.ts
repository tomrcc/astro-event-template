import { getCollection, type CollectionEntry } from 'astro:content';
import type { Block } from '../content.config';
import site from '../data/site.json';
import event from '../data/event.json';

type Speakers = CollectionEntry<'speakers'>[];

const lines = (...parts: (string | null | undefined | false)[]) =>
	parts.filter((part) => part != null && part !== false).join('\n');

function speakerName(speakers: Speakers, slug: string | null | undefined) {
	return speakers.find((speaker) => speaker.id === slug)?.data.name;
}

function blockText(block: Block, speakers: Speakers): string {
	switch (block._type) {
		case 'hero':
			return lines(`## ${block.heading}`, block.subheading);
		case 'text':
			return lines(block.heading && `## ${block.heading}`, block.content);
		case 'speakers':
			return lines(
				block.heading && `## ${block.heading}`,
				block.intro,
				...block.speakers.map((slug) => `- ${speakerName(speakers, slug) ?? slug}`),
			);
		case 'schedule':
			return lines(
				block.heading && `## ${block.heading}`,
				...block.sessions.map((session) => {
					const who = speakerName(speakers, session.speaker);
					return `- ${session.time}: ${session.title}${who ? ` (${who})` : ''}${session.location ? `, ${session.location}` : ''}. ${session.description ?? ''}`;
				}),
			);
		case 'tickets':
			return lines(
				block.heading && `## ${block.heading}`,
				block.intro,
				...block.tiers.map((tier) => `- ${tier.name}: ${tier.price}. ${tier.description ?? ''}`),
			);
		case 'faq':
			return lines(
				block.heading && `## ${block.heading}`,
				...block.items.map((item) => `Q: ${item.question}\nA: ${item.answer}`),
			);
		case 'assistant':
		case 'enquiry':
			return '';
	}
}

/** The whole site as Markdown, for /llms.txt and the chat assistant's context. */
export async function siteContent() {
	// Homepage first, so the summary leads.
	const pages = (await getCollection('pages')).sort((a, b) => Number(b.id === 'index') - Number(a.id === 'index'));
	const speakers = await getCollection('speakers');

	const pageText = pages.map((page) => {
		const url = page.id === 'index' ? '/' : `/${page.id}/`;
		const body =
			'content_blocks' in page.data
				? page.data.content_blocks.map((block) => blockText(block, speakers)).filter(Boolean).join('\n\n')
				: page.body;
		return lines(`# ${page.data.title} (${url})`, page.data.description, '', body);
	});

	const speakerText = speakers.map((speaker) =>
		lines(
			`## ${speaker.data.name} (/speakers/${speaker.id}/)`,
			[speaker.data.role, speaker.data.company].filter(Boolean).join(', '),
			speaker.body,
		),
	);

	return [
		lines(`# ${site.title}`, `> ${site.description}`, '', `${event.name}: ${event.date} at ${event.venue}, ${event.address}.`),
		...pageText,
		lines('# Speakers', '', speakerText.join('\n\n')),
	].join('\n\n');
}
