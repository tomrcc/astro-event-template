import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({
	label: z.string().nullish(),
	url: z.string().nullish(),
});

const blocks = z.discriminatedUnion('_type', [
	z.object({
		_type: z.literal('hero'),
		heading: z.string(),
		subheading: z.string().nullish(),
		image: z.string().nullish(),
		image_alt: z.string().nullish(),
		button: link,
	}),
	z.object({
		_type: z.literal('text'),
		heading: z.string().nullish(),
		content: z.string().nullish(),
	}),
	z.object({
		_type: z.literal('speakers'),
		heading: z.string().nullish(),
		intro: z.string().nullish(),
		speakers: z.array(z.string()).default([]),
	}),
	z.object({
		_type: z.literal('schedule'),
		heading: z.string().nullish(),
		sessions: z
			.array(
				z.object({
					time: z.string().nullish(),
					title: z.string().nullish(),
					speaker: z.string().nullish(),
					location: z.string().nullish(),
					description: z.string().nullish(),
				}),
			)
			.default([]),
	}),
	z.object({
		_type: z.literal('tickets'),
		heading: z.string().nullish(),
		intro: z.string().nullish(),
		seats_label: z.string().nullish(),
		sold_out_label: z.string().nullish(),
		tiers: z
			.array(
				z.object({
					name: z.string().nullish(),
					price: z.string().nullish(),
					description: z.string().nullish(),
					button: link,
				}),
			)
			.default([]),
	}),
	z.object({
		_type: z.literal('faq'),
		heading: z.string().nullish(),
		items: z
			.array(z.object({ question: z.string().nullish(), answer: z.string().nullish() }))
			.default([]),
	}),
	z.object({
		_type: z.literal('assistant'),
		heading: z.string().nullish(),
		intro: z.string().nullish(),
	}),
	z.object({
		_type: z.literal('enquiry'),
		heading: z.string().nullish(),
		intro: z.string().nullish(),
		name_label: z.string().nullish(),
		email_label: z.string().nullish(),
		message_label: z.string().nullish(),
		button_label: z.string().nullish(),
		success_message: z.string().nullish(),
		error_message: z.string().nullish(),
	}),
]);

export type Block = z.infer<typeof blocks>;
export type BlockProps<T extends Block['_type']> = Omit<Extract<Block, { _type: T }>, '_type'>;

const pageFields = {
	title: z.string(),
	description: z.string().nullish(),
};

const pages = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
	schema: z.union([
		z.object({ ...pageFields, content_blocks: z.array(blocks) }),
		z.object(pageFields),
	]),
});

const speakers = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/speakers' }),
	schema: z.object({
		name: z.string(),
		role: z.string().nullish(),
		company: z.string().nullish(),
		photo: z.string().nullish(),
		photo_alt: z.string().nullish(),
	}),
});

export const collections = { pages, speakers };
