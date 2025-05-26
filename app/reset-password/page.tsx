"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const type = searchParams.get("type")

    if (type === "recovery" && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      setIsValidToken(true)
    } else {
      setIsValidToken(false)
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setIsSuccess(true)

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Loading state while checking token validity
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
              <p className="text-gray-400 mb-6">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/")}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Go to Home
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h1>
              <p className="text-gray-400 mb-6">
                Your password has been successfully updated. You will be redirected to the home page shortly.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
              <p className="text-gray-400 text-sm">Enter your new password below</p>
            </div>

            {/* Form */}
            <div className="p-6">
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm">{errors.submit}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-purple-500"
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                  <p className="mt-1 text-xs text-gray-400">Must contain uppercase, lowercase, and number</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-600 focus:ring-purple-500"
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Password strength:</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.password.length >= 8 ? "bg-green-400" : "bg-gray-600"
                        }`}
                      />
                      <span className={`text-xs ${formData.password.length >= 8 ? "text-green-400" : "text-gray-400"}`}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? "bg-green-400" : "bg-gray-600"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        Uppercase and lowercase letters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /(?=.*\d)/.test(formData.password) ? "bg-green-400" : "bg-gray-600"
                        }`}
                      />
                      <span
                        className={`text-xs ${/(?=.*\d)/.test(formData.password) ? "text-green-400" : "text-gray-400"}`}
                      >
                        At least one number
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.password === formData.confirmPassword && formData.confirmPassword
                            ? "bg-green-400"
                            : "bg-gray-600"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          formData.password === formData.confirmPassword && formData.confirmPassword
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push("/")}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
