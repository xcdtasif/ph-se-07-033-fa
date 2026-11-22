import Link from "next/link"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-fetch"
import type { Property } from "@/lib/types"

import { RequestDialog } from "./request-dialog"

// In place of the button, at its height, as on the request cards
const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground flex min-h-7 items-center text-center text-sm">{children}</p>
)

/*
The call to action for the viewer: tenants get the request form, guests a login
link that comes back here. Reads cookies, so it sits inside <Suspense>.
*/
export async function RequestToRent({ property }: { property: Property }) {
  // Only AVAILABLE properties take requests, whoever is asking
  if (property.status !== "AVAILABLE") {
    return <Note>Only available properties can be requested</Note>
  }

  const user = await getCurrentUser()

  if (!user.success) {
    // Logged out (or the session ended): log in, then come back to this page
    if (user.statusCode === 401) {
      return (
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/properties/${property.id}`)}`}
          className={buttonVariants({ size: "sm", className: "text-sm" })}
        >
          Log in as tenant to request
        </Link>
      )
    }

    // Banned (403) or backend unavailable: the backend's own message
    return <Note>{user.message}</Note>
  }

  if (user.data.role !== "TENANT") {
    return <Note>Only tenants can request to rent</Note>
  }

  return <RequestDialog propertyId={property.id} propertyName={property.name} />
}
