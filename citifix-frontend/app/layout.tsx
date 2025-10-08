import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import ToasterDemo from "@/components/ui/toaster"
import ConditionalNavbar from "@/components/conditional-navbar"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "citiFix - Community Issue Tracker",
  description: "Report and track community issues in your neighborhood",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-black text-white">
        <AuthProvider>
          <ConditionalNavbar />
          <main className="pt-20">{children}</main>
          <ToasterDemo />
        </AuthProvider>
      </body>
    </html>
  )
}
