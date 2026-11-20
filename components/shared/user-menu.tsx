"use client"

import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"

type UserMenuProps = {
  user: Pick<User, "name">
}

export function UserMenu({ user }: UserMenuProps) {
  const [pending, startTransition] = useTransition()

  const logout = () =>
    startTransition(async () => {
      toast.success("Logged out successfully")
      await logoutAction()
    })

  return (
    <DropdownMenu>
      {/* Just the initial; screen readers get the full name */}
      <DropdownMenuTrigger
        className={buttonVariants({ size: "icon", className: "rounded-full uppercase" })}
        disabled={pending}
      >
        <span aria-hidden="true">{user.name.charAt(0)}</span>
        <span className="sr-only">Account menu for {user.name}</span>
      </DropdownMenuTrigger>
      {/* Ends on the page's content edge, in line with the cards below; just fits its items */}
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuItem render={<Link href="/profile" />} className="justify-center">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} disabled={pending} className="justify-center">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
