"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { X, Paperclip, FileImage, AlertCircle, CheckCircle } from "lucide-react"
import Header from "@/components/Header"
import SearchResultsLayout from "@/components/SearchResultsLayout"
import AuthModals from "@/components/AuthModals"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthModal } from "@/hooks/useAuthModal"
import EmailVerificationBanner from "@/components/EmailVerificationBanner"
import { useEmailVerification } from "@/hooks/useEmailVerification"
import { callChatEdgeFunction, callProductSearch } from "@/lib/api"

interface UploadedImage {
  file: File
  preview: string
  status: "uploading" | "success" | "error"
  id: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [initialChatMessages, setInitialChatMessages] = useState<any[]>([])
  const [initialProducts, setInitialProducts] = useState<any[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, loading } = useAuth()
  const { isOpen, mode, openModal, closeModal, changeMode } = useAuthModal()
  const { needsVerification } = useEmailVerification()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
    setIsInitialLoading(true)
    try {
      let chatRes;
      if (query.trim().toLowerCase() === "show me trending products") {
        // Use summarize mode for onboarding
        chatRes = await callChatEdgeFunction({ kind: "text", text: `Summarize this product search intent for a user in plain English: ${query}` })
      } else {
        // Normal intent extraction
        chatRes = await callChatEdgeFunction({ kind: "text", text: query })
      }
      console.log('DEBUG: chat edge function response', chatRes);
      const aiMsg = {
        id: Date.now().toString(),
        type: "ai",
        content: chatRes.reply || chatRes.choices?.[0]?.message?.content || "",
        timestamp: new Date(),
      }
      setInitialChatMessages([aiMsg])
      // Call product search
      const products = await callProductSearch(query)
      setInitialProducts(products)
    } catch (err) {
      setInitialChatMessages([
        {
          id: Date.now().toString(),
          type: "ai",
          content: "Sorry, something went wrong.",
          timestamp: new Date(),
        },
      ])
      setInitialProducts([])
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleProductClick = (product: any) => {
    router.push(`/product/${product.product_id}?keywords=${encodeURIComponent(searchQuery)}`)
  }

  // Image Upload Functions
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image format. Please use JPEG, PNG, GIF, or WebP.`)
        return
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Please use images under 10MB.`)
        return
      }

      const id = crypto.randomUUID()
      const preview = URL.createObjectURL(file)

      const newImage: UploadedImage = {
        file,
        preview,
        status: "uploading",
        id,
      }

      setUploadedImages((prev) => [...prev, newImage])

      // Simulate upload process
      setTimeout(() => {
        setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "success" } : img)))
      }, 2000)
    })
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSearchWithImages = async () => {
    const successfulImages = uploadedImages.filter((img) => img.status === "success")
    if (successfulImages.length > 0) {
      setHasSearched(true)
      setIsInitialLoading(true)
      try {
        // Only use the first image for now
        const img = successfulImages[0]
        const base64 = await fileToBase64(img.file)
        const chatRes = await callChatEdgeFunction({ kind: "image", image: base64 })
        const aiMsg = {
          id: Date.now().toString(),
          type: "ai",
          content: chatRes.reply || chatRes.choices?.[0]?.message?.content || "",
          timestamp: new Date(),
        }
        setInitialChatMessages([aiMsg])
        // Use any text from the AI as the search query, fallback to generic
        const searchQ = aiMsg.content || "products"
        const products = await callProductSearch(searchQ)
        setInitialProducts(products)
      } catch (err) {
        setInitialChatMessages([
          {
            id: Date.now().toString(),
            type: "ai",
            content: "Sorry, something went wrong.",
            timestamp: new Date(),
          },
        ])
        setInitialProducts([])
      } finally {
        setIsInitialLoading(false)
      }
    }
  }

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(",")[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Show loading state while checking authentication
  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // If user is logged in and has searched, or if search has been initiated
  if (hasSearched || (user && searchQuery)) {
    return (
      <SearchResultsLayout
        searchQuery={searchQuery || "products"}
        onProductClick={handleProductClick}
        onNewSearch={handleSearch}
        initialChatMessages={initialChatMessages}
        initialProducts={initialProducts}
      />
    )
  }

  // Landing page with refactored layout
  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(270deg, #a78bfa, #8b5cf6, #f472b6, #facc15, #a78bfa)",
            backgroundSize: "1200% 1200%",
            animation: "gradientMove 16s ease-in-out infinite",
            opacity: 0.9,
          }}
        />
        <style jsx global>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center justify-center">
              <h1 className="text-4xl md:text-6xl font-bold">Let's go shopping!</h1>
              <p className="text-lg text-white/80">Built to make you extraordinarily productive, discover amazing products with ease.</p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-8 px-10 py-5 bg-white/10 backdrop-blur-md text-white text-xl font-semibold rounded-full shadow-xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-3 group mx-auto"
              >
                Start Shopping
                <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModals isOpen={isOpen} mode={mode} onClose={closeModal} onModeChange={changeMode} />
    </>
  )
}
