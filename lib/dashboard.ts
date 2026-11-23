import type { UserRole } from "./types"

export type DashboardSection = { href: string; label: string }

/*
The dashboard pages each role has. `/dashboard` opens the first; a role with none sees no
Dashboard menu and is sent to its profile.
*/
export const DASHBOARD_SECTIONS: Record<UserRole, DashboardSection[]> = {
  TENANT: [
    { href: "/dashboard/requests", label: "Requests" },
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/reviews", label: "Reviews" },
  ],
  LANDLORD: [{ href: "/dashboard/overview", label: "Overview" }],
  ADMIN: [],
}
