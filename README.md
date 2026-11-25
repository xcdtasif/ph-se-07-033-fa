# RentNest Frontend

Web app for a rental property marketplace. Tenants browse properties, request one and pay the
deposit through Stripe, landlords list properties and handle requests, and admins moderate the
platform.

| Link          | URL                                                            |
| ------------- | -------------------------------------------------------------- |
| Live site     | <https://ph-se-07-033-fa.vercel.app>                           |
| Live API      | <https://ph-se-07-033-ba.vercel.app>                           |
| Frontend repo | [ph-se-07-033-fa](https://github.com/xcdtasif/ph-se-07-033-fa) |
| Backend repo  | [ph-se-07-033-ba](https://github.com/xcdtasif/ph-se-07-033-ba) |

## Overview

| Role     | Can do                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public   | Browse featured properties, search and filter the property grid, open a property's photo gallery and reviews                                                       |
| Tenant   | Request a property or cancel a request, pay the deposit on Stripe Checkout, see payments, review a completed rental                                                |
| Landlord | See figures for properties, earnings, reviews and requests, add, edit and delete properties with photos, toggle availability, approve, reject or complete requests |
| Admin    | See platform figures, ban or unban users, manage categories, hide properties and reviews, view all requests                                                        |

Everyone gets a profile page and a dashboard at `/dashboard` whose pages depend on the role. Every
page has a loading skeleton and every list an empty state, errors show as toasts, field errors or
an error page, and there's a light and dark theme.

### How It Works

- **Auth:** the login and signup actions call the backend and store its tokens as `httpOnly`
  cookies on this site. `proxy.ts` checks the session on protected routes (`/dashboard`,
  `/payments`, `/profile`), refreshes an expired one and sends a role away from pages it can't
  open.
- **Role pages:** dashboard URLs carry no role. `proxy.ts` rewrites a shared URL such as
  `/dashboard/requests` to the role's own page (`/dashboard/requests/tenant`), so each role sees
  its own UI at the same address.
- **Data:** Server Components fetch on the server. Public data is cached and expired by tag after
  a write; per-user data is fetched inside `<Suspense>` behind a skeleton.
- **Payments:** Pay deposit asks the backend for a Stripe Checkout session and redirects to it.
  Stripe returns to `/payments/success`, which looks the payment up by its session, or to
  `/payments/cancel`.

## Tech Stack

| Area          | Technology                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Runtime       | Node.js 24, TypeScript                                                      |
| Framework     | Next.js 16 (App Router, Cache Components), React 19                         |
| Styling       | Tailwind CSS 4, shadcn/ui on Base UI, lucide icons, next-themes             |
| Data          | Server Components with `fetch`, Server Actions for writes, `use cache` tags |
| Auth          | JWT in `httpOnly` cookies, route protection in `proxy.ts`                   |
| Validation    | Zod, shared by forms and Server Actions                                     |
| Payments      | Stripe Checkout, created by the backend                                     |
| Uploads       | UploadThing, through the backend's route                                    |
| Notifications | Sonner toasts                                                               |
| Tooling       | pnpm, oxlint, oxfmt                                                         |
| Deployment    | Vercel                                                                      |

## Getting Started

### Prerequisites

- Node 24 and [pnpm](https://pnpm.io)
- The [backend](https://github.com/xcdtasif/ph-se-07-033-ba) running locally, or the live API

### Setup

```
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`, then start the server:

```
pnpm dev
```

Open <http://localhost:3000>.

### Environment Variables

| Variable  | Purpose                                                               |
| --------- | --------------------------------------------------------------------- |
| `API_URL` | Backend origin, such as `http://localhost:5000` or the live API's URL |

### Sample Data

The live API has the backend's sample data. Every sample user's password is `1a2s3d4f`.

| Role     | Email                  |
| -------- | ---------------------- |
| Tenant   | `tenant01@gmail.com`   |
| Landlord | `landlord01@gmail.com` |

`tenant01` has `APPROVED` requests, so the payment flow can be tried right away with Stripe's test
card `4242 4242 4242 4242`, any future expiry date and any CVC.

### Scripts

| Script       | What it does                             |
| ------------ | ---------------------------------------- |
| `pnpm dev`   | Start the dev server with reload         |
| `pnpm build` | Clear `.next`, then build for production |
| `pnpm start` | Run the production build                 |
| `pnpm fmt`   | Format the code                          |
| `pnpm lint`  | Lint the code and apply fixes            |

## API Integration

[API_INTEGRATION.md](API_INTEGRATION.md) explains how the frontend calls the backend, and lists
every endpoint with the route, component and Server Action that use it.

## Project Structure

```
app/
  (auth)/            Login and signup
  properties/        Property grid and details pages
  dashboard/         /dashboard and its pages, one folder per page, a subfolder per role
  payments/          Stripe's success and cancel pages
  profile/           Profile page
  error.tsx, not-found.tsx, global-error.tsx
components/
  shared/            Navbar, footer, cards, pagination and other app components
  ui/                shadcn/ui components
lib/                 API calls, auth cookies, types, formatting and shared schemas
hooks/               useFormAction, which runs a Server Action from a form
proxy.ts             Route protection and role rewrites
```

Each route keeps its own `_components`, `_actions` (Server Actions) and `_schemas` (Zod) folders.

## Deployment

The app deploys to Vercel. Set `API_URL` in the project to the live API. The backend's
`CLIENT_URL` must be this site's URL: it's the only origin the backend allows, and where Stripe
sends the tenant back after checkout.
