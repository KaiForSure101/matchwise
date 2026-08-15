import { cn } from "@/lib/utils"

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="max-w-2xl space-y-2">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#0f4c45]/70">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#0f4c45] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#0f4c45]/10 bg-white/80 p-5 shadow-[0_20px_60px_-48px_rgba(15,76,69,0.45)] sm:p-6",
        className
      )}
    >
      <div className="mb-4 space-y-1">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0f4c45]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function FormMessage({
  error,
  success,
}: {
  error?: string | null
  success?: string | null
}) {
  if (error) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (success) {
    return (
      <p className="rounded-lg bg-[#0f4c45]/10 px-3 py-2 text-sm text-[#0f4c45]">
        {success}
      </p>
    )
  }
  return null
}

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}
