"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"

function EmailVerificationForm() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    verifyEmail()
  }, [])

  const verifyEmail = async () => {
    try {
      const token = searchParams.get("token")
      const type = searchParams.get("type")
      const accessToken = searchParams.get("access_token")
      const refreshToken = searchParams.get("refresh_token")

      // Check if this is a confirmation link from email
      if (type === "signup" && accessToken && refreshToken) {
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error("Session error:", error)
          setVerificationStatus("error")
          setErrorMessage("Invalid verification link. Please try again.")
          return
        }

        if (data.user) {
          setUserEmail(data.user.email || "")

          // Check if email is already confirmed
          if (data.user.email_confirmed_at) {
            setVerificationStatus("success")
          } else {
            setVerificationStatus("error")
            setErrorMessage("Email verification failed. Please try again.")
          }
        }
      } else if (token) {
        // Handle token-based verification (if using custom tokens)
        setVerificationStatus("error")
        setErrorMessage("Invalid verification link format.")
      } else {
        // No valid verification parameters
        setVerificationStatus("error")
        setErrorMessage("Invalid verification link. Please check your email for the correct link.")
      }
    } catch (error: any) {
      console.error("Verification error:", error)
      setVerificationStatus("error")
      setErrorMessage("An error occurred during verification. Please try again.")
    }
  }

  const resendVerificationEmail = async () => {
    if (!userEmail) {
      setErrorMessage("No email address found. Please sign up again.")
      return
    }

    setIsResending(true)
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
      setErrorMessage(error.message || "Failed to resend verification email.")
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    // Redirect to home page or dashboard
    router.push("/")
  }

  // Loading state
  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying your email...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Email Verified Successfully!</h1>
              <p className="text-gray-400 mb-6">
                Your email address has been verified. You can now access all features of ShopWizz.ai.
              </p>
              {userEmail && (
                <div className="bg-gray-700/50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-300">Verified email:</p>
                  <p className="text-white font-medium">{userEmail}</p>
                </div>
              )}
              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Continue to ShopWizz.ai
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{errorMessage}</p>

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm">Verification email sent! Please check your inbox.</span>
              </div>
            )}

            <div className="space-y-3">
              {userEmail && (
                <button
                  onClick={resendVerificationEmail}
                  disabled={isResending}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isResending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>

            {userEmail && (
              <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Verification email will be sent to:</p>
                <p className="text-sm text-white">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <EmailVerificationForm />
    </Suspense>
  )
}
