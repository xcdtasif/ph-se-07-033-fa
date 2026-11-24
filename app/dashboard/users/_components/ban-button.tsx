"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFormAction } from "@/hooks/use-form-action"
import type { UserRole } from "@/lib/types"

import { setUserBannedAction } from "../_actions/user-actions"

type BanButtonProps = {
  userId: string
  role: Exclude<UserRole, "ADMIN">
  isBanned: boolean
}

/*
Unbanning happens at once. Banning asks first, since it logs the user out at once and, for a
landlord, hides their properties from tenants.
*/
export function BanButton({ userId, role, isBanned }: BanButtonProps) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => setUserBannedAction(userId, role, !isBanned),
    () => setOpen(false),
  )

  if (isBanned) {
    return (
      <form action={formAction}>
        <Button type="submit" variant="outline" size="sm" className="text-sm" disabled={pending}>
          {pending ? "Saving…" : "Unban"}
        </Button>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Ban
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban this user?</DialogTitle>
          <DialogDescription>
            {role === "LANDLORD"
              ? "They'll be logged out and their properties hidden until they're unbanned."
              : "They'll be logged out and can't log in until they're unbanned."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Banning…" : "Ban user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
