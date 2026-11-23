import type { UserRole } from "./types"

export type DashboardSection = { href: string; label: string }

/*
The dashboard pages each role has, in the navbar's Dashboard menu. `/dashboard` opens the
first; the landlord and admin ones come with their pages, and until then those roles have no
Dashboard menu.
*/
export const DASHBOARD_SECTIONS: Record<UserRole, DashboardSection[]> = {
  TENANT: [
    { href: "/dashboard/requests", label: "Requests" },
    { href: "/dashboard/payments", label: "Payments" },
  ],
  LANDLORD: [],
  ADMIN: [],
}
