"use client"

import { toast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function useToast() {
  return {
    toast: ({ title, description, action }: ToastProps) => {
      toast(title ?? description ?? "", {
        description,
        action,
      })
    },
  }
}
