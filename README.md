# Tarangkumar Patel — Portfolio

My personal portfolio, built with Next.js. A single-page experience covering Home, About, Work, Life, and Contact, with a Firebase-backed admin panel for managing projects and incoming messages.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) for page transitions and interactive animation
- [Firebase](https://firebase.google.com) (Firestore) for project data and contact messages

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

## Project Structure

- `src/app` — routes, layout, and global styles
- `src/components/sections` — Home, About, Work, Life, and Contact views
- `src/components/ui` — shared UI primitives and animation helpers
- `src/components/admin` — admin login and dashboard for managing projects
- `src/lib/firebase.js` — Firebase client setup
- `src/data/mockProjects.js` — fallback project data

## Environment Variables

Firebase config is read from `.env.local` (see `NEXT_PUBLIC_FIREBASE_*` keys). This file is git-ignored and must be configured per environment (including in Vercel's project settings for production).

## Deployment

Deployed on [Vercel](https://vercel.com), connected to the `main` branch for automatic deploys.
