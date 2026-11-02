import Hero from '../components/blocks/Hero.astro';
import Text from '../components/blocks/Text.astro';
import Speakers from '../components/blocks/Speakers.astro';
import Schedule from '../components/blocks/Schedule.astro';
import Tickets from '../components/blocks/Tickets.astro';
import Faq from '../components/blocks/Faq.astro';
import Assistant from '../components/blocks/Assistant.astro';
import Enquiry from '../components/blocks/Enquiry.astro';

// Keys are the `_type` values in content_blocks.
export const componentMap: Record<string, any> = {
	hero: Hero,
	text: Text,
	speakers: Speakers,
	schedule: Schedule,
	tickets: Tickets,
	faq: Faq,
	assistant: Assistant,
	enquiry: Enquiry,
};
