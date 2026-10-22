# EduMatch registration

Public routes: `/register` for students, `/register?role=teacher` for teachers and `/register?role=center` for training centers. All render through the project's `AuthLayout`, without a header. The login page's “Đăng ký ngay” link opens this route.

The three-role selector preserves entered values while changing the fields and benefits. Every role requires an email address. Students and teachers enter name, email, phone, date of birth, password and password confirmation. Training centers enter center name, email, phone, password and password confirmation. A native date input opens the device's date picker; future and invalid birth dates are rejected, without imposing an age restriction.

The teacher profile contains only three required fields: qualifications/certificates (text, 500 characters), teaching experience (text, 500 characters), and overview information. The former subject, area, teaching mode and separate work-experience fields are omitted from both the UI and the payload. Training centers enter center name, email, phone (login identifier), password, confirmation and an unrestricted capability profile; date of birth is not required for this role. Passwords retain the project's minimum of 8 characters.

Registration validates only the active role's fields, then calls the existing `authService.register`. Successful responses return to login with the registered email or center phone; server errors stay in the form. The UI does not simulate successful account creation.

The current API service posts to `/auth/register`. Shared account fields are `name`, `email`, `phone`, `password`, and `role` (`student`, `teacher`, or `center`). Student/teacher payloads also include `dateOfBirth` as `YYYY-MM-DD`. `teacherProfile` contains `qualification`, `experience`, and `biography`. For centers, `name` is the center name and `centerProfile.description` contains the unrestricted description. The generic `bio` field is deliberately omitted for centers because the API limits that generic field to 5,000 characters. `buildRegistrationPayload` explicitly excludes inactive fields and password confirmation. The repository has no backend schema; these frontend payload fields and the new `center` role require alignment with the real API during backend integration.

Native radio buttons and labelled date/text inputs provide keyboard access. The first invalid field receives focus; password visibility toggles, character counts, and disabled submission states are included. Role tabs retain full accessible names while their visible labels are kept short for mobile.

Typography and layout share `src/styles/theme.css` with the homepage and login: a 1240px content container, responsive gutters, 12px control text, 44px controls, 16px surfaces, and the existing Be Vietnam Pro font. Both authentication forms use a 440px card and matching padding. The document reserves scrollbar space to keep horizontal alignment stable across routes. See `src/styles/README.md` for the shared Tailwind utilities and CSS tokens.

## Image asset

`src/assets/register-student.webp` was generated with the built-in ImageGen tool, using the user-provided registration screenshot as a photographic reference, then compressed as WebP while preserving transparency.

Final prompt:

> Use case: photorealistic-natural. Asset type: transparent photo cutout for EduMatch account registration page. Input reference is the attached EduMatch registration UI screenshot, use ONLY the photo in the bottom-right for subject style and pose, do not recreate website UI. Generate a natural editorial photograph of a smiling Vietnamese female young adult, long dark hair, cream knit sweater with subtle sage-green stripes, seated at a white desk, looking gently toward the left. Silver laptop in front of her toward left, her right hand holding a blue pen over an open notebook toward right. Composition: torso-up landscape about 4:3, all hair fully visible, both hands natural, laptop and narrow tabletop included, subject occupies image. Soft daylight, photorealistic skin and fabric. Background genuinely transparent with alpha, no mint blobs, no room, no decor, no icons, no text, no logo, no UI. Only person, laptop, notebook, pen, tabletop. Balanced clean cutout edges.
