import type { Metadata } from "next"
import { Fraunces, Manrope } from "next/font/google"

import "./globals.css"

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Matchwise",
    template: "%s · Matchwise",
  },
  description:
    "Evidence-informed, context-aware human matching that adapts to your relationship goal.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
