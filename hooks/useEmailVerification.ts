"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export function useEmailVerification() {
  const { user } = useAuth()
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkEmailVerification()
  }, [user])

  const checkEmailVerification = async () => {
    if (!user) {
      setIsEmailVerified(null)
      setIsLoading(false)
      return
    }

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setIsEmailVerified(!!authUser.email_confirmed_at)
      } else {
        setIsEmailVerified(false)
      }
    } catch (error) {
      console.error("Error checking email verification:", error)
      setIsEmailVerified(false)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshVerificationStatus = () => {
    setIsLoading(true)
    checkEmailVerification()
  }

  return {
    isEmailVerified,
    isLoading,
    refreshVerificationStatus,
    needsVerification: user && isEmailVerified === false,
  }
}
