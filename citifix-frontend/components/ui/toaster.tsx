"use client"

import { Toaster } from "sonner"

export default function ToasterDemo() {
  return (
    <Toaster
      richColors
      position="top-right"
      closeButton
      expand
      duration={4000}
    />
  )
}
