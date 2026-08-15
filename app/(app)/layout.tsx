import { redirect } from "next/navigation"

import { AppNav } from "@/components/dashboard/app-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  ensureProfileRow,
  getProfileBundle,
} from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/server"

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  let displayName =
    (user.user_metadata as { display_name?: string }).display_name ||
    user.email?.split("@")[0] ||
    "Member"

  try {
    await ensureProfileRow()
    const bundle = await getProfileBundle()
    if (bundle.profile?.display_name) {
      displayName = bundle.profile.display_name
    }
  } catch {
    // Schema may not be applied yet; fall back to auth metadata.
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[linear-gradient(180deg,#f4faf9_0%,#eef6f4_40%,#f7f3ea_100%)]">
      <DashboardHeader displayName={displayName} email={user.email ?? ""} />
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
