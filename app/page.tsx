import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(15,116,110,0.18),transparent_45%),radial-gradient(ellipse_at_90%_10%,rgba(196,149,74,0.16),transparent_40%),linear-gradient(165deg,#f3faf8_0%,#e8f4f1_38%,#f6f1e6_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%230f4c45%27 fill-opacity=%270.04%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#0f4c45]">
          Matchwise
        </p>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }), "bg-[#0f4c45] text-white hover:bg-[#0c3d38]")}
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-20 pt-10 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="max-w-xl space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight text-[#0f4c45] sm:text-6xl lg:text-7xl">
              Matchwise
            </p>
            <h1 className="text-2xl font-medium leading-snug tracking-tight text-[#1f2f2c] sm:text-3xl">
              Find the right person for what you&apos;re trying to create
            </h1>
            <p className="max-w-md text-base leading-relaxed text-[#4d5f5b] sm:text-lg">
              Evidence-informed matching that changes with your goal — dating,
              friends, study, activities, work, teams, or something custom.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#0f4c45] px-5 text-white hover:bg-[#0c3d38]"
                )}
              >
                Start matching
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-[#0f4c45]/20 bg-white/60 px-5 backdrop-blur-sm"
                )}
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div
            aria-hidden
            className="relative min-h-[280px] animate-in fade-in zoom-in-95 duration-1000 sm:min-h-[360px]"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(145deg,#0f4c45_0%,#1a6b62_42%,#c4954a_100%)] shadow-[0_40px_80px_-40px_rgba(15,76,69,0.65)]" />
            <div className="absolute inset-[12%] rounded-[1.5rem] border border-white/25 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute left-[18%] top-[22%] h-24 w-24 rounded-full bg-[#f6f1e6]/90 blur-[1px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[16%] h-32 w-32 rounded-full bg-white/25" />
            <div className="absolute inset-0 flex items-end p-8 sm:p-10">
              <p className="max-w-[14rem] font-[family-name:var(--font-display)] text-2xl font-medium leading-tight text-white sm:text-3xl">
                Context first.
                <br />
                Compatibility second.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
