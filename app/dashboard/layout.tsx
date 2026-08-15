import { redirect } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
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

  const metadata = user.user_metadata as {
    display_name?: string
    full_name?: string
    name?: string
  }

  const displayName =
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "Member"

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[linear-gradient(180deg,#f4faf9_0%,#eef6f4_40%,#f7f3ea_100%)]">
      <DashboardHeader displayName={displayName} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  )
}
