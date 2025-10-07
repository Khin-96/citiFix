"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        CitiFix
      </Link>

      <div className="hidden md:flex gap-4">
        <Link href="/issues" className="hover:text-blue-600">
          Issues
        </Link>
        {/* <Link href="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link> */}
        <Link href="/leaderboard" className="hover:text-blue-600">
          Leaderboard
        </Link>
        <Link href="/notifications" className="hover:text-blue-600">
          Notifications
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>Hello, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Login
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-16 right-6 bg-white shadow-md p-4 flex flex-col gap-2 md:hidden">
          <Link href="/issues">Issues</Link>
          {/* <Link href="/dashboard">Dashboard</Link> */}
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/notifications">Notifications</Link>
        </div>
      )}
    </nav>
  )
}
