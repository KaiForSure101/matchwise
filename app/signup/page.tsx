import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign up · Matchwise",
}

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Matchwise adapts its logic to your goal — dating, friends, study, work, and more."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0f4c45] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  )
}
