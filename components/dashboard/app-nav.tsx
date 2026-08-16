"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/custom", label: "Custom Match" },
  { href: "/profile", label: "Profile" },
  { href: "/profile/mode", label: "Mode" },
  { href: "/profile/preferences", label: "Preferences" },
  { href: "/profile/interests", label: "Interests" },
  { href: "/profile/skills", label: "Skills" },
  { href: "/profile/availability", label: "Availability" },
  { href: "/onboarding", label: "Setup" },
] as const

// Optional admin debug link: controlled by NEXT_PUBLIC_ADMIN_DEBUG at build time.
// The actual debug route is guarded by ADMIN_DEBUG on the server; NEXT_PUBLIC_ADMIN_DEBUG simply shows the link in the UI for convenience during development.
const SHOW_ADMIN_DEBUG = process.env.NEXT_PUBLIC_ADMIN_DEBUG === "true"

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="overflow-x-auto border-b border-[#0f4c45]/10 bg-white/50">
      <ul className="mx-auto flex w-full max-w-6xl gap-1 px-4 py-2 sm:px-8">
        {LINKS.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[#0f4c45] text-white"
                    : "text-[#0f4c45]/80 hover:bg-[#0f4c45]/8"
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
        {SHOW_ADMIN_DEBUG ? (
          <li>
            <Link
              href="/profile/debug"
              className={cn(
                "inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                pathname === "/profile/debug" ? "bg-[#0f4c45] text-white" : "text-[#0f4c45]/80 hover:bg-[#0f4c45]/8"
              )}
            >
              Admin Debug
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
