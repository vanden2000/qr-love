# QR Love - Project Core

## Project Goal

Build a QR-based interactive digital gift experience.

User flow:

Create Gift
→ Generate unique gift link
→ Generate QR code
→ Receiver scans QR
→ Open gift
→ Interactive romantic experience

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- React Three Fiber
- Three.js
- Vercel

## Architecture

Use a single Next.js full-stack project.

Do not introduce:
- Laravel
- Express
- Separate backend
- MySQL server

Use Supabase later for:
- PostgreSQL
- Image storage
- Audio storage

## Coding Rules

- Use TypeScript.
- Avoid `any`.
- Keep page.tsx small.
- Put reusable components inside components/.
- Put business logic inside lib/.
- Put shared types inside types/.
- Do not duplicate logic.
- Avoid unnecessary dependencies.
- Do not over-engineer.

## Mobile

This application is mobile-first because users primarily enter through QR scanning.

Primary viewport targets:

- 375px
- 390px
- 430px

## Important

Do not implement features that were not requested.

Before changing architecture, inspect the existing project first.

After implementing a feature:

1. Check TypeScript.
2. Run ESLint.
3. Run production build.
4. Fix errors caused by the implementation.