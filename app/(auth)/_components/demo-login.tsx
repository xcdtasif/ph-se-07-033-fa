"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { FieldSeparator } from "@/components/ui/field"
import { useFormAction } from "@/hooks/use-form-action"

import { demoLoginAction } from "../_actions/auth-actions"

const ACCOUNTS = [
  { value: "admin", label: "Admin 01" },
  { value: "landlord", label: "Landlord 01" },
  { value: "tenant", label: "Tenant 01" },
]

/*
Logs in as a sample user in one click; the clicked button's value names the account. It always
opens /dashboard, which the proxy rewrites to the account's role, rather than `?redirectTo=`, as
the page there may belong to another role
*/
export function DemoLogin() {
  const router = useRouter()
  const [, formAction, pending] = useFormAction(demoLoginAction, () => router.push("/dashboard"))

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* The card's background, not the page's, behind the separator's text */}
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
        Or try a demo account
      </FieldSeparator>
      <div className="flex flex-wrap gap-2">
        {ACCOUNTS.map(({ value, label }) => (
          <Button
            key={value}
            type="submit"
            name="account"
            value={value}
            variant="outline"
            className="flex-1"
            disabled={pending}
          >
            {label}
          </Button>
        ))}
      </div>
    </form>
  )
}
