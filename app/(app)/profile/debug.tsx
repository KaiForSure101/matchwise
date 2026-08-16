import { notFound } from "next/navigation"
import { getProfileBundle } from "@/lib/actions/profile"
import { getDiscoveryResults } from "@/lib/actions/discovery"

export default async function ProfileDebugPage() {
  const enabled = process.env.ADMIN_DEBUG === "true"
  if (!enabled) return notFound()

  const bundle = await getProfileBundle()
  const activeMode = bundle.profile?.active_mode ?? "dating"
  const discovery = await getDiscoveryResults(activeMode as any)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Admin Debug (Profile)</h1>

      <section className="rounded-xl border border-[#0f4c45]/10 bg-white/80 p-4">
        <h2 className="font-medium">Profile bundle (server-side)</h2>
        <pre className="mt-2 max-h-64 overflow-auto text-xs">{JSON.stringify(bundle, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-[#0f4c45]/10 bg-white/80 p-4">
        <h2 className="font-medium">Discovery top results for mode: {activeMode}</h2>
        <p className="text-xs text-muted-foreground">Showing the server-evaluated discovery results (eligibility, quality, confidence)</p>
        <pre className="mt-2 max-h-96 overflow-auto text-xs">{JSON.stringify(discovery.slice(0, 10), null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-[#0f4c45]/10 bg-white/80 p-4">
        <h2 className="font-medium">Notes</h2>
        <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
          <li>This route is protected by the ADMIN_DEBUG environment flag and only available when enabled.</li>
          <li>It exposes only server-side bundle and discovery output for the current signed-in user. Do not enable in production.</li>
        </ul>
      </section>
    </div>
  )
}
