import { logInAgainAction, logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { Button } from "@/components/ui/button"
import type { ApiFailure } from "@/lib/api"

import { RetryButton } from "./retry-button"

/*
Shows a failed backend read on the page itself. Errors thrown from a Server
Component reach error.tsx with a generic message in production, so expected
failures are rendered here instead, with the backend's own message.
*/
export function ApiError({ error }: { error: ApiFailure }) {
  // Account deleted or token rejected: say why, then start a fresh session
  if (error.statusCode === 401) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border p-8 text-center"
      >
        <h2 className="text-lg font-semibold">Your session has ended</h2>
        <p className="text-muted-foreground max-w-md">{error.message}</p>
        <form action={logInAgainAction}>
          <Button type="submit">Log in again</Button>
        </form>
      </div>
    )
  }

  // Banned, or not allowed: retrying won't help, logging out lets them switch account
  if (error.statusCode === 403) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border p-8 text-center"
      >
        <h2 className="text-lg font-semibold">You can&apos;t access this page</h2>
        <p className="text-muted-foreground max-w-md">{error.message}</p>
        <form action={logoutAction}>
          <Button type="submit">Log out</Button>
        </form>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-xl border p-8 text-center"
    >
      <h2 className="text-lg font-semibold">
        {error.statusCode === 0 ? "Can't reach the server" : "Something went wrong"}
      </h2>
      <p className="text-muted-foreground max-w-md">{error.message}</p>
      <RetryButton />
    </div>
  )
}
