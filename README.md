# Social Welfare Namibia

A practical social-welfare MVP built for the AWS User Group Windhoek **“For The People” Hackathon**. It helps people across Namibia find services, speak privately with professionals, join community campaigns, and seek anonymous peer support.

## Implemented features

- Firebase email/password sign-in.
- Separate member and professional registration flows.
- Firestore profiles with member details, professional qualifications, certifications, location, role, and verification status.
- Sign-in protection only on **Talk to Someone**; all discovery and community pages remain public.
- A campaign calendar with professional-only event publishing, public pinning, and campaign-specific Realtime Database group chats.
- **Better Together**, an open forum where members and guests are anonymous while professionals are identified by role.
- SOFI mental-health assistant connected to Gemini through a server-only API key.
- Shared typography, colors, buttons, responsive navigation, and mobile layouts.

## Local setup

Requirements: Node.js 20 or newer.

```bash
npm install
copy .env.example .env
npm run build
npm start
```

Set `GEMINI_API_KEY` in `.env` before starting the production server. The key is read only by `server.mjs` and is never bundled into the browser.

For local development, one command starts both the frontend and SOFI API server:

```bash
npm run dev
```

Vite proxies `/api` to the local SOFI server on port `4174`. `server.mjs` loads `.env`
automatically without exposing its values to the browser.

## Firebase setup

The app defaults to the supplied `social-welfare-app-9f22a` project. It uses:

- Authentication: email/password
- Firestore: `users`, `Professionals`, `campaigns`, and `forumPosts`
- Realtime Database: `campaignChats/{campaignId}/messages`

Deploy the included rules with the Firebase CLI:

```bash
firebase use social-welfare-app-9f22a
firebase deploy --only firestore:rules,database
```

To load demonstration campaign chats, import [public/campaign-chats.seed.json](public/campaign-chats.seed.json) from the Firebase Realtime Database console.

The rules deliberately allow public forum and campaign-chat contributions because those features are inclusive of guests. They validate lengths and force non-professional forum authors to use the anonymous label. Add moderation, App Check, and rate limiting before a large public launch.

## Production / AWS EC2

1. Install Node.js 20+ on the EC2 instance.
2. Copy the repository and run `npm ci && npm run build`.
3. Add `GEMINI_API_KEY` to the instance environment.
4. Run `npm start` behind Nginx or a process manager such as systemd.
5. Allow the chosen HTTP/HTTPS ports in the EC2 security group.

`server.mjs` serves the Vite `dist` directory, supports SPA routes, and exposes `POST /api/sofi`.

## Verification

```bash
npm run lint
npm run build
```

The application was also visually checked at desktop and mobile breakpoints.
