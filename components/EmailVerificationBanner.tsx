"use client"

import { useState } from "react"
import { Mail, X, RefreshCw, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface EmailVerificationBannerProps {
  userEmail: string
  onDismiss?: () => void
}

export default function EmailVerificationBanner({ userEmail, onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const resendVerificationEmail = async () => {
    setIsResending(true)
    setError("")
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      })

      if (error) throw error

      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error: any) {
      setError(error.message || "Failed to resend verification email.")
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Mail className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-yellow-300 font-medium mb-1">Verify Your Email Address</h3>
          <p className="text-yellow-200/80 text-sm mb-3">
            Please check your email and click the verification link to access all features.
          </p>

          {resendSuccess && (
            <div className="mb-3 p-2 bg-green-900/30 border border-green-700 rounded flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">Verification email sent!</span>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded">
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center justify-center space-x-1"
            >
              {isResending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Email</span>
                </>
              )}
            </button>
            <span className="text-yellow-200/60 text-xs self-center">Sent to: {userEmail}</span>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
