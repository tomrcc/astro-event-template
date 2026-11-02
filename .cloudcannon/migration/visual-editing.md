# Visual editing census

| Page | Section | Treatment | Binding plan | Data completeness | Justification |
| --- | --- | --- | --- | --- | --- |
| All pages | Header | data-file + array | `@data[site].title`; `@data[site].nav` array, relative `label`; `@data[site].cta.label` | Link URLs sidebar-only | — |
| All pages | Footer | data-file + array | `@data[event].name/date/venue/address`; `@data[site].footer_text`; `@data[site].footer_links` array, relative `label` | All in data files | — |
| Page builder | All blocks | page builder | `content_blocks` array, `data-component-key="_type"`, `data-component={_type}` per item, all 8 types registered | — | — |
| Page builder | Hero | text + image | `heading`, `subheading`, `image`/`image_alt`, `button.label`; event date and venue via `@data[event]` | — | — |
| Page builder | Text | text | `heading`, `content` (markdown, block) | — | — |
| Page builder | Speakers | component | `heading`, `intro`; cards looked up from `speakers` inside the block, re-rendered on multiselect change | Speaker fields edited on the speaker page | — |
| Page builder | Schedule | component + array | `sessions` array, relative `time`, `title`, `description`, `location`; speaker name via lookup | — | — |
| Page builder | Tickets | component + array | `heading`, `intro`; `tiers` array, relative `name`, `price`, `description`, `button.label`; seats wording sidebar-only | Seat count is example data in the editor build | Seats text is computed from `seats_label` and the count |
| Page builder | FAQ | array | `items` array, relative `question`, `answer`; items open in the editor build | — | — |
| Page builder | Assistant | text + data-file array | `heading`, `intro`; `@data[chat].greeting`; `@data[chat].suggestions` primitive array with `<template>` | Placeholder and unavailable message sidebar-only | Placeholder is an input attribute; unavailable message only shows after a failed reply |
| Page builder | Enquiry | text | `heading`, `intro`, `*_label`, `button_label`; success and error messages sidebar-only | — | Messages only show after submitting |
| Text page | Title and body | text | `title`, `@content` | — | — |
| Speaker | Profile | text + image | `photo`/`photo_alt`, `name`, `role`, `company`, `@content` | — | — |
