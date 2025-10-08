"use client"

import { usePathname } from "next/navigation"
import NavbarWrapper from "@/components/navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()
  

  const hideNavbarRoutes = ["/", "/login", "/register"]
  
  if (hideNavbarRoutes.includes(pathname)) {
    return null
  }
  
  return <NavbarWrapper />
}