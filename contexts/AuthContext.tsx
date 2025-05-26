"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  resendVerification: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await refreshUser()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error getting initial session:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { signIn: authSignIn } = await import("@/lib/auth")
    await authSignIn(email, password)
    await refreshUser()
  }

  const signUp = async (email: string, password: string) => {
    const { signUp: authSignUp } = await import("@/lib/auth")
    await authSignUp(email, password)
    await refreshUser()
  }

  const signOut = async () => {
    const { signOut: authSignOut } = await import("@/lib/auth")
    await authSignOut()
    setUser(null)
  }

  const resendVerification = async (email: string) => {
    const { resendEmailVerification } = await import("@/lib/auth")
    await resendEmailVerification(email)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    resendVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
