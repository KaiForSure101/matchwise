import { ModeSelector } from "@/components/dashboard/mode-selector"

export const metadata = {
  title: "Dashboard · Matchwise",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#0f4c45]/70">
          Your workspace
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#0f4c45] sm:text-4xl">
          Find the right person for what you&apos;re trying to create
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Start by picking a relationship goal. Matching logic, confidence, and
          explanations will adapt to that context in later phases.
        </p>
      </div>
      <ModeSelector />
    </div>
  )
}
