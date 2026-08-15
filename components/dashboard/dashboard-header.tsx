"use client"

import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/dashboard/sign-out-button"

type DashboardHeaderProps = {
  displayName: string
  email: string
}

export function DashboardHeader({ displayName, email }: DashboardHeaderProps) {
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M"

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#0f4c45]/10 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-8">
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[#0f4c45]"
        >
          Matchwise
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Dashboard
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-1.5 pr-3 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <Avatar size="sm">
            <AvatarFallback className="bg-[#0f4c45] text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[10rem] truncate">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
