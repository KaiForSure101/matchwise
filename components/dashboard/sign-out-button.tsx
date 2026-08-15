"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full cursor-pointer text-left disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  )
}
