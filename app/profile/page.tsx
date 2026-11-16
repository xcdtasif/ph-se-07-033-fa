import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth-fetch"
import { formatDate } from "@/lib/format"

import { ProfileForm } from "./_components/profile-form"

export const metadata: Metadata = {
  title: "Profile",
}

async function ProfileDetails() {
  const result = await getCurrentUser()

  // The proxy lets the page through on an unverified token; the backend has the final say
  if (!result.success) {
    if (result.statusCode === 401) {
      redirect("/login?redirectTo=/profile")
    }

    throw new Error(result.message)
  }

  const user = result.data
  const details = [
    { label: "Email", value: user.email },
    { label: "Role", value: user.role.charAt(0) + user.role.slice(1).toLowerCase() },
    { label: "Member since", value: formatDate(user.createdAt) },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Account</h2>
          </CardTitle>
          <CardDescription>Your email and role can&apos;t be changed.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Edit profile</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} />
        </CardContent>
      </Card>
    </>
  )
}

export default function ProfilePage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <Suspense fallback={<div className="bg-muted h-72 animate-pulse rounded-xl" />}>
        <ProfileDetails />
      </Suspense>
    </section>
  )
}
