"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export default function NavbarWrapper() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`backdrop-blur-md bg-black/40 fixed w-full z-50 transition-all duration-300 shadow-lg
        ${scrolled ? "py-2" : "py-4"}
      `}
    >
      <div className="flex justify-between items-center px-6 md:px-12">
        {/* Logo */}
        <Link
          href="/"
          className={`text-white font-extrabold tracking-wide transition-all duration-300 ${
            scrolled ? "text-xl" : "text-2xl"
          }`}
        >
          CitiFix
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-white font-medium">
          <Link href="/issues" className="hover:text-gray-300 transition-colors">
            Issues
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-300 transition-colors">
            Leaderboard
          </Link>
          <Link href="/notifications" className="hover:text-gray-300 transition-colors">
            Notifications
          </Link>
        </div>

        {/* User Actions & Mobile Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:block text-white">
                Hello, <strong>{user.name}</strong>
              </span>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg shadow-md backdrop-blur-sm transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg shadow-md backdrop-blur-sm transition-all"
            >
              Login
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden text-2xl text-white hover:text-gray-300 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full right-6 bg-black/40 backdrop-blur-md text-white shadow-xl rounded-xl p-6 flex flex-col gap-4 w-48 md:hidden mt-2">
          <Link href="/issues" className="hover:text-gray-300 transition-colors">
            Issues
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-300 transition-colors">
            Leaderboard
          </Link>
          <Link href="/notifications" className="hover:text-gray-300 transition-colors">
            Notifications
          </Link>
          {user && (
            <button
              onClick={logout}
              className="mt-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg shadow transition-all"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
