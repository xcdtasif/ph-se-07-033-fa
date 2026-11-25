# API Integration

How the frontend talks to the [RentNest Backend](https://ph-se-07-033-ba.vercel.app), and which
component calls which endpoint. The backend's endpoints are documented in its
[API Docs](https://github.com/xcdtasif/ph-se-07-033-ba/tree/main/docs/api-docs).

## How Requests Are Made

| Piece                 | What it does                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/api.ts`          | `apiFetch` calls `API_URL` and returns `{ success, statusCode, message, data, meta }`. A network failure becomes a result with status `0` instead of a thrown error, so every caller handles it |
| `lib/auth-fetch.ts`   | `authFetch` forwards the `accessToken` cookie to the backend. Without one it answers `401` itself                                                                                               |
| `lib/auth-cookies.ts` | Copies the tokens from the backend's `Set-Cookie` onto this site, as `httpOnly` cookies                                                                                                         |
| `proxy.ts`            | Protects `/dashboard`, `/payments` and `/profile`: checks the session with `GET /api/users/me`, refreshes it with `POST /api/auth/refresh`, and picks the role's dashboard page                 |
| Server Components     | Read data on the server with `apiFetch` (public, cached) or `authFetch` (per user, inside `<Suspense>`)                                                                                         |
| Server Actions        | Every write. Forms show field errors inline and the backend's message as a toast                                                                                                                |

A failed read shows `ApiError` (`components/shared/api-error.tsx`) in place of the list: the
backend's message and a Retry button, or Log in again when the session is gone.

## Public

| Feature                   | Route                          | Component                           | Action | Endpoint                                  |
| ------------------------- | ------------------------------ | ----------------------------------- | ------ | ----------------------------------------- |
| Featured properties       | `/`                            | `app/page.tsx` via `getProperties`  | x      | `GET /api/properties?limit=…`             |
| Property grid and filters | `/properties`                  | `app/properties/page.tsx`           | x      | `GET /api/properties?…`                   |
| Category filter           | `/properties`                  | `app/properties/page.tsx`           | x      | `GET /api/categories`                     |
| Property details          | `/properties/[id]`             | `app/properties/[id]/page.tsx`      | x      | `GET /api/properties/:id`                 |
| Property reviews          | `/properties/[id]`             | `property-reviews.tsx`              | x      | `GET /api/properties/:propertyId/reviews` |
| Navbar, Request to rent   | every page, `/properties/[id]` | `navbar.tsx`, `request-to-rent.tsx` | x      | `GET /api/users/me`                       |

`getProperties`, `getProperty` and `getPropertyReviews` live in `lib/properties.ts`,
`getCategories` in `lib/categories.ts`.

## Auth and Profile

| Feature         | Route                                           | Component                            | Action                | Endpoint                 |
| --------------- | ----------------------------------------------- | ------------------------------------ | --------------------- | ------------------------ |
| Sign up         | `/signup`                                       | `signup-form.tsx`                    | `signupAction`        | `POST /api/auth/signup`  |
| Log in          | `/login`                                        | `login-form.tsx`                     | `loginAction`         | `POST /api/auth/login`   |
| Log out         | every page (navbar)                             | `logout-button.tsx`, `api-error.tsx` | `logoutAction`        | x                        |
| Session refresh | `/dashboard`, `/payments`, `/profile` and below | `proxy.ts`                           | x                     | `POST /api/auth/refresh` |
| Profile         | `/profile`                                      | `app/profile/page.tsx`               | x                     | `GET /api/users/me`      |
| Edit profile    | `/profile`                                      | `profile-form.tsx`                   | `updateProfileAction` | `PATCH /api/users/me`    |

Log out deletes the token cookies on this site and calls no endpoint: the backend keeps no
session, so there is nothing to end there.

## Tenant

| Feature                       | Route                 | Component                       | Action                | Endpoint                                    |
| ----------------------------- | --------------------- | ------------------------------- | --------------------- | ------------------------------------------- |
| Dashboard figures             | `/dashboard`          | `tenant-overview.tsx`           | x                     | `GET /api/tenant/requests?status=…&limit=1` |
| Request to rent               | `/properties/[id]`    | `request-dialog.tsx`            | `createRequestAction` | `POST /api/tenant/requests`                 |
| Requests list                 | `/dashboard/requests` | `tenant-requests.tsx`           | x                     | `GET /api/tenant/requests?…`                |
| Cancel a request              | `/dashboard/requests` | `cancel-request-dialog.tsx`     | `cancelRequestAction` | `PATCH /api/tenant/requests/:id`            |
| Pay deposit (Stripe Checkout) | `/dashboard/requests` | `pay-deposit-button.tsx`        | `payDepositAction`    | `POST /api/tenant/payments/create`          |
| Payment result                | `/payments/success`   | `app/payments/success/page.tsx` | x                     | `GET /api/tenant/payments?sessionId=…`      |
| Payments table                | `/dashboard/payments` | `tenant-payments.tsx`           | x                     | `GET /api/tenant/payments?…`                |
| Leave a review                | `/dashboard/requests` | `review-dialog.tsx`             | `createReviewAction`  | `POST /api/tenant/reviews`                  |
| Reviews list                  | `/dashboard/reviews`  | `tenant-reviews.tsx`            | x                     | `GET /api/tenant/reviews?…`                 |

`/payments/cancel` makes no call: Stripe sends the tenant back there, and the request stays
`APPROVED`, ready to pay again.

## Landlord

| Feature                   | Route                                                           | Component                                    | Action                          | Endpoint                                                                          |
| ------------------------- | --------------------------------------------------------------- | -------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| Dashboard figures         | `/dashboard`                                                    | `landlord-overview.tsx`                      | x                               | `GET /api/landlord/properties`, `/api/landlord/reviews`, `/api/landlord/requests` |
| Properties list           | `/dashboard/properties`                                         | `landlord-properties.tsx`                    | x                               | `GET /api/landlord/properties?…`                                                  |
| Availability toggle       | `/dashboard/properties`                                         | `availability-button.tsx`                    | `setPropertyAvailabilityAction` | `PATCH /api/landlord/properties/:id`                                              |
| Property details          | `/dashboard/properties/[id]`, `/dashboard/properties/[id]/edit` | `get-own-property.ts`                        | x                               | `GET /api/landlord/properties/:id`                                                |
| Property's reviews        | `/dashboard/properties/[id]`                                    | `own-property-reviews.tsx`                   | x                               | `GET /api/landlord/reviews?propertyId=…`                                          |
| Property's requests       | `/dashboard/properties/[id]`                                    | `landlord-requests.tsx`                      | x                               | `GET /api/landlord/requests?propertyId=…`                                         |
| Category choices          | `/dashboard/properties/add`, `/dashboard/properties/[id]/edit`  | `add/page.tsx`, `[id]/edit/page.tsx`         | x                               | `GET /api/categories`                                                             |
| Photo upload              | `/dashboard/properties/add`, `/dashboard/properties/[id]/edit`  | `property-form.tsx` via `lib/uploadthing.ts` | x                               | `POST /api/uploadthing` (rewritten to the backend in `next.config.ts`)            |
| Add a property            | `/dashboard/properties/add`                                     | `add/page.tsx`, `property-form.tsx`          | `createPropertyAction`          | `POST /api/landlord/properties`                                                   |
| Edit a property           | `/dashboard/properties/[id]/edit`                               | `[id]/edit/page.tsx`, `property-form.tsx`    | `updatePropertyAction`          | `PATCH /api/landlord/properties/:id`                                              |
| Delete a property         | `/dashboard/properties/[id]/edit`                               | `delete-property-dialog.tsx`                 | `deletePropertyAction`          | `DELETE /api/landlord/properties/:id`                                             |
| Incoming requests         | `/dashboard/requests`                                           | `landlord-requests.tsx`                      | x                               | `GET /api/landlord/requests?…`                                                    |
| Approve, reject, complete | `/dashboard/requests`, `/dashboard/properties/[id]`             | `landlord-request-item.tsx`                  | `setRequestStatusAction`        | `PATCH /api/landlord/requests/:id`                                                |

## Admin

| Feature                 | Route                   | Component                    | Action                    | Endpoint                                                       |
| ----------------------- | ----------------------- | ---------------------------- | ------------------------- | -------------------------------------------------------------- |
| Dashboard figures       | `/dashboard`            | `admin-overview.tsx`         | x                         | `GET /api/admin/users`, `/properties`, `/requests`, `/reviews` |
| Users table             | `/dashboard/users`      | `users-table.tsx`            | x                         | `GET /api/admin/users?…`                                       |
| Ban or unban a user     | `/dashboard/users`      | `ban-button.tsx`             | `setUserBannedAction`     | `PATCH /api/admin/users/:id`                                   |
| Categories list         | `/dashboard/categories` | `categories-list.tsx`        | x                         | `GET /api/admin/categories?…`                                  |
| Add a category          | `/dashboard/categories` | `add-category-form.tsx`      | `createCategoryAction`    | `POST /api/categories`                                         |
| Rename a category       | `/dashboard/categories` | `rename-category-dialog.tsx` | `renameCategoryAction`    | `PATCH /api/categories/:id`                                    |
| Delete a category       | `/dashboard/categories` | `delete-category-dialog.tsx` | `deleteCategoryAction`    | `DELETE /api/categories/:id`                                   |
| Properties table        | `/dashboard/properties` | `admin-properties.tsx`       | x                         | `GET /api/admin/properties?…`                                  |
| Hide or show a property | `/dashboard/properties` | `admin-properties.tsx`       | `setPropertyHiddenAction` | `PATCH /api/admin/properties/:id`                              |
| Requests list           | `/dashboard/requests`   | `admin-requests.tsx`         | x                         | `GET /api/admin/requests?…`                                    |
| Reviews list            | `/dashboard/reviews`    | `admin-reviews.tsx`          | x                         | `GET /api/admin/reviews?…`                                     |
| Hide or show a review   | `/dashboard/reviews`    | `admin-reviews.tsx`          | `setReviewHiddenAction`   | `PATCH /api/admin/reviews/:id`                                 |

Banning a landlord also reads their properties (`GET /api/admin/properties?landlordId=…`) to
refresh the cached public pages that list them.

## Endpoints Not Called

| Endpoint                   | Why                                |
| -------------------------- | ---------------------------------- |
| `POST /api/stripe/webhook` | Called by Stripe, not the frontend |
