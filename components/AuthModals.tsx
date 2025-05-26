"use client"

import type React from "react"

import { useState } from "react"
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { resetPassword } from "@/lib/auth"

interface AuthModalsProps {
  isOpen: boolean
  mode: "signin" | "signup" | "forgot-password"
  onClose: () => void
  onModeChange: (mode: "signin" | "signup" | "forgot-password") => void
}

export default function AuthModals({ isOpen, mode, onClose, onModeChange }: AuthModalsProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (mode !== "forgot-password") {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number"
      }

      // Confirm password validation for signup
      if (mode === "signup") {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        }

        // Name validation for signup
        if (!formData.firstName.trim()) {
          newErrors.firstName = "First name is required"
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = "Last name is required"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      if (mode === "signin") {
        await signIn(formData.email, formData.password)
        onClose()
      } else if (mode === "signup") {
        await signUp(formData.email, formData.password)
        setSuccessMessage(
          "Account created successfully! Please check your email and click the verification link to activate your account.",
        )
        // Don't close modal immediately, let user see success message
        setTimeout(() => {
          onClose()
        }, 5000)
      } else if (mode === "forgot-password") {
        await resetPassword(formData.email)
        setSuccessMessage(
          "Password reset email sent! Please check your inbox and follow the instructions to reset your password.",
        )
        setTimeout(() => {
          onModeChange("signin")
        }, 3000)
      }
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

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    })
    setErrors({})
    setSuccessMessage("")
  }

  const handleModeChange = (newMode: "signin" | "signup" | "forgot-password") => {
    resetForm()
    onModeChange(newMode)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <h2 className="text-xl font-semibold text-white">
              {mode === "signin" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "forgot-password" && "Reset Password"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm">{successMessage}</span>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{errors.submit}</span>
            </div>
          )}

          {mode === "forgot-password" && !successMessage && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields for signup */}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-purple-500"
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-purple-500"
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-purple-500"
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password field */}
            {mode !== "forgot-password" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-purple-500"
                    }`}
                    placeholder="••••••••"
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
                {mode === "signup" && (
                  <p className="mt-1 text-xs text-gray-400">Must contain uppercase, lowercase, and number</p>
                )}
              </div>
            )}

            {/* Confirm Password field for signup */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
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
                    placeholder="••••••••"
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
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>
                  {mode === "signin" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot-password" && "Send Reset Email"}
                </span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            {mode === "signin" && (
              <>
                <button
                  onClick={() => handleModeChange("forgot-password")}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot your password?
                </button>
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => handleModeChange("signup")}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === "signup" && (
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => handleModeChange("signin")}
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === "forgot-password" && (
              <p className="text-sm text-gray-400">
                Remember your password?{" "}
                <button
                  onClick={() => handleModeChange("signin")}
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Terms and Privacy for signup */}
          {mode === "signup" && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
