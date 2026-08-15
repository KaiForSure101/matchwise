import Link from "next/link"
import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign in · Matchwise",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to choose a matching mode and continue building the right kind of connection."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#0f4c45] underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
