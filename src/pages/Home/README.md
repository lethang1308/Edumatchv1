# EduMatch homepage

Built on the existing React 19, Vite, React Router, Tailwind 4 and Lucide base. The page reuses the shared Button, Modal, authentication and local storage modules.

## Design

- Reference: the homepage screenshot supplied by the user.
- Direction: light, trustworthy Vietnamese education marketplace with an emerald accent.
- Design variance: 5; motion intensity: 3; visual density: 5.
- Typography: self-hosted Be Vietnam Pro, with Vietnamese glyph support.
- Surface radius: 16px; controls: 10px; avatar and utility shapes follow their specific roles.
- Background: the supplied `src/assets/backgroup.png`, used in the hero and closing call to action. An optimized WebP version is selected through CSS image-set, with the original PNG as the fallback.
- Theme: system preference initially; the header toggle saves a manual light/dark preference.

## Working interactions

- Search by teacher name, subject or introduction, including Vietnamese text without accents.
- Filter by subject, teaching mode, maximum hourly fee and minimum rating.
- Save favourite teachers in local storage, then filter the saved list.
- Open profile details, expand the teacher list and discover additional subjects.
- Responsive navigation and FAQ disclosures.
- Accessible shared modals with Escape, focus containment, focus restoration and scroll locking.
- Preview the consultation form with browser validation and a clearly labelled local completion state.

Teacher profiles, reviews and portraits are sample content. Portraits are placeholders from Random User, not photographs of the named teachers. Registration, consultation delivery and booking require backend integration; the interface does not claim that submissions were sent. The existing `/login` and `/dashboard` routes are preserved.

## Image generation

Tool: built-in `image_gen`, with the supplied screenshot as a visual reference and transparent output enabled.

Source asset: `src/assets/tutoring-hero.png`. The production page uses `src/assets/tutoring-hero.webp`, compressed to quality 85 while preserving alpha. The original user background is preserved.

Final prompt:

> Use case: photorealistic-natural. Asset type: transparent website hero photo for Vietnamese tutoring platform EduMatch. Input image is a visual reference for the people in the hero ONLY, not a website to recreate. Generate a high quality natural photo cutout of a smiling Vietnamese female teacher in her late 20s wearing a sage green overshirt over a cream top, sitting beside a Vietnamese teenage female student wearing a cream striped top and white over-ear headphones. They are learning together, looking down at a silver open laptop on a pale desk; teacher pointing gently at the screen, student writing in a notebook. Match the friendly natural editorial photography, facial quality, pose and arrangement from the upper-right hero of the reference screenshot. Waist-up composition, both people fully visible including hair and arms, teacher left and slightly taller, student right. Include laptop and narrow strip of desk along the bottom. Transparent background with actual alpha, no room, plants, background, text, logo, badges, or UI. Soft daylight, realistic hands and skin texture, green and cream wardrobe. Landscape roughly 4:3, people occupy most of frame, minimal empty padding.

## Development

`npm run dev` starts the development server. `npm run build` creates the production bundle and `npm run lint` checks the source.

The homepage is implemented in `Home.jsx`, its sample data in `homeData.js`, and its semantic palette and responsive layouts in `home.css`.
