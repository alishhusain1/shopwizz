"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Header from "@/components/Header"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error("Reset password error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We encountered an error while processing your password reset. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
