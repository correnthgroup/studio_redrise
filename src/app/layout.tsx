import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "@xyflow/react/dist/style.css"
import "./globals.css"
import { AppProviders } from "@/components/providers/app-providers"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Redrise",
  description: "Business automation platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
