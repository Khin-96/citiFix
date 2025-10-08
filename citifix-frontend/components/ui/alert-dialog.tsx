"use client"

import * as React from "react"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">{children}</div>
      </div>
    </div>
  )
}

export const AlertDialogAction = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
  >
    {children}
  </button>
)

export const AlertDialogCancel = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition"
  >
    {children}
  </button>
)
