import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,116,110,0.12),_transparent_55%),linear-gradient(180deg,#f4faf9_0%,#eef6f4_45%,#f7f3ea_100%)]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[#0f4c45]">
          Matchwise
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Back home
        </Link>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-md rounded-2xl border border-[#0f4c45]/10 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(15,76,69,0.45)] backdrop-blur-sm sm:p-8">
          <div className="mb-6 space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#0f4c45]">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </main>
    </div>
  )
}
