# EduMatch registration

Public route: `/register` for students, `/register?role=teacher` for teachers. Both render through the project's `AuthLayout`, without a header. The login page's “Đăng ký ngay” link opens this route.

The role selector preserves entered values while changing the fields and benefits. Registration validates account details and the teacher selectors, then calls the existing `authService.register`. Successful responses return to login with the registered email. Server errors stay in the form; the UI does not simulate successful account creation.

The current API service posts to `/auth/register`. Account fields are `name`, `email`, `phone`, `password`, and `role` (`student` or `teacher`). Teacher fields are grouped under `teacherProfile`: `subject`, `area`, `teachingMode`, `experience`, `qualification`, `biography`, and `workExperience`. The repository has no backend schema; confirm these fields against the real API when integrating the backend.

Native radio buttons, selects and labelled inputs provide keyboard access. The first invalid field receives focus; password visibility toggles, character counts, and disabled submission states are included.

Typography and layout share `src/styles/edumatch-tokens.css` with the homepage and login: a 1240px content container, responsive gutters, 12px control text, 44px controls, 16px surfaces, and the existing Be Vietnam Pro font. Both authentication forms use a 440px card and matching padding. The document reserves scrollbar space to keep horizontal alignment stable across routes.

## Image asset

`src/assets/register-student.webp` was generated with the built-in ImageGen tool, using the user-provided registration screenshot as a photographic reference, then compressed as WebP while preserving transparency.

Final prompt:

> Use case: photorealistic-natural. Asset type: transparent photo cutout for EduMatch account registration page. Input reference is the attached EduMatch registration UI screenshot, use ONLY the photo in the bottom-right for subject style and pose, do not recreate website UI. Generate a natural editorial photograph of a smiling Vietnamese female young adult, long dark hair, cream knit sweater with subtle sage-green stripes, seated at a white desk, looking gently toward the left. Silver laptop in front of her toward left, her right hand holding a blue pen over an open notebook toward right. Composition: torso-up landscape about 4:3, all hair fully visible, both hands natural, laptop and narrow tabletop included, subject occupies image. Soft daylight, photorealistic skin and fabric. Background genuinely transparent with alpha, no mint blobs, no room, no decor, no icons, no text, no logo, no UI. Only person, laptop, notebook, pen, tabletop. Balanced clean cutout edges.
