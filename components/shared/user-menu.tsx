"use client"

import { LogOut, UserRound } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"

type UserMenuProps = {
  user: Pick<User, "name" | "email" | "role">
}

const roleLabel = (role: User["role"]) => role.charAt(0) + role.slice(1).toLowerCase()

export function UserMenu({ user }: UserMenuProps) {
  const [pending, startTransition] = useTransition()

  const logOut = () =>
    startTransition(async () => {
      toast.success("Logged out successfully")
      await logoutAction()
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" })} disabled={pending}>
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium uppercase"
        >
          {user.name.charAt(0)}
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
        <span className="sr-only sm:hidden">Account menu for {user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-foreground">
            <span className="block truncate text-sm">{user.name}</span>
            <span className="text-muted-foreground block truncate font-normal">{user.email}</span>
            <span className="text-muted-foreground block font-normal">{roleLabel(user.role)}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserRound aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logOut} disabled={pending}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
