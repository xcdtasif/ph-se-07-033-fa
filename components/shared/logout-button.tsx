"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { Button } from "@/components/ui/button"

// An outline button, beside the Profile button in the navbar and under it in the menu
export function LogoutButton({
  className,
  onLogout,
}: {
  className?: string
  // Runs on press, e.g. to close the menu it sits in
  onLogout?: () => void
}) {
  const [pending, startTransition] = useTransition()

  const logout = () =>
    startTransition(async () => {
      onLogout?.()
      toast.success("Logged out successfully")
      await logoutAction()
    })

  return (
    <Button variant="outline" className={className} onClick={logout} disabled={pending}>
      Log out
    </Button>
  )
}
