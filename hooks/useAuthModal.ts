"use client"

import { useState } from "react"

export type AuthModalMode = "signin" | "signup" | "forgot-password"

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthModalMode>("signin")

  const openModal = (modalMode: AuthModalMode = "signin") => {
    setMode(modalMode)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const changeMode = (newMode: AuthModalMode) => {
    setMode(newMode)
  }

  return {
    isOpen,
    mode,
    openModal,
    closeModal,
    changeMode,
  }
}
