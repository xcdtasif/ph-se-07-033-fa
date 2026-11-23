import type { Metadata } from "next"

import { AuthLink } from "@/components/shared/auth-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { LoginForm } from "../_components/login-form"

export const metadata: Metadata = {
  title: "Log in",
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1>Log in</h1>
        </CardTitle>
        <CardDescription>
          New to RentNest?{" "}
          <AuthLink href="/signup" className="text-foreground link-underline">
            Sign up
          </AuthLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
