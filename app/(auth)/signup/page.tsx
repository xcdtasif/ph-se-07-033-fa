import type { Metadata } from "next"

import { AuthLink } from "@/components/shared/auth-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { SignupForm } from "../_components/signup-form"

export const metadata: Metadata = {
  title: "Sign up",
}

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1>Create your account</h1>
        </CardTitle>
        <CardDescription>
          Already have one?{" "}
          <AuthLink href="/login" className="text-foreground link-underline">
            Log in
          </AuthLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  )
}
