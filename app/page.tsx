"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { X, Mic, Paperclip, FileImage, AlertCircle, CheckCircle } from "lucide-react"
import Header from "@/components/Header"
import SearchResultsLayout from "@/components/SearchResultsLayout"
import AuthModals from "@/components/AuthModals"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthModal } from "@/hooks/useAuthModal"
import EmailVerificationBanner from "@/components/EmailVerificationBanner"
import { useEmailVerification } from "@/hooks/useEmailVerification"

interface UploadedImage {
  file: File
  preview: string
  status: "uploading" | "success" | "error"
  id: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceTranscript, setVoiceTranscript] = useState("")

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { user, loading } = useAuth()
  const { isOpen, mode, openModal, closeModal, changeMode } = useAuthModal()
  const { needsVerification } = useEmailVerification()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  // Voice Recording Functions
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setVoiceTranscript("")

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // TODO: Implement actual voice recording
    // Simulate voice recognition after 3 seconds
    setTimeout(() => {
      if (recordingIntervalRef.current) {
        stopRecording()
        setVoiceTranscript("Find me comfortable running shoes under $100")
      }
    }, 3000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleVoiceSearch = () => {
    if (voiceTranscript.trim()) {
      handleSearch(voiceTranscript.trim())
    }
  }

  const clearVoiceTranscript = () => {
    setVoiceTranscript("")
    setRecordingTime(0)
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

  const handleSearchWithImages = () => {
    const successfulImages = uploadedImages.filter((img) => img.status === "success")
    if (successfulImages.length > 0) {
      // TODO: Implement image-based search
      handleSearch(`Find similar products to uploaded images`)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
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
      />
    )
  }

  // Landing page with refactored layout
  return (
    <>
      <div
        className={`min-h-screen bg-gray-900 text-white ${isDragOver ? "bg-purple-900/10" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Header />

        {needsVerification && user && (
          <div className="max-w-4xl mx-auto px-4 pt-6">
            <EmailVerificationBanner userEmail={user.email} />
          </div>
        )}

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 border-4 border-dashed border-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-400 mb-2">Drop Images Here</h3>
              <p className="text-gray-400">Release to upload and search for similar products</p>
            </div>
          </div>
        )}

        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-4xl w-full text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold">Let's go shopping!</h1>

            {/* Main Search Input */}
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a product, or try voice/image search below"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-purple-900/30 border border-purple-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      handleSearch(searchQuery.trim())
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch(searchQuery.trim())}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Search
                  </button>
                )}
              </div>

              {/* Voice Transcript Display */}
              {voiceTranscript && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Voice transcript:</span>
                    <button
                      onClick={clearVoiceTranscript}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white mb-3">"{voiceTranscript}"</p>
                  <button
                    onClick={handleVoiceSearch}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Search with Voice
                  </button>
                </div>
              )}

              {/* Image Upload Preview */}
              {uploadedImages.length > 0 && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">{uploadedImages.length} image(s) uploaded</span>
                    </div>
                    <button
                      onClick={handleSearchWithImages}
                      disabled={!uploadedImages.some((img) => img.status === "success")}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Search Similar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt="Upload preview"
                          className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />

                        {/* Status Indicator */}
                        <div className="absolute top-2 left-2">
                          {image.status === "uploading" && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          )}
                          {image.status === "success" && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {image.status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>

                        {/* File Name */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Search Categories - Moved above voice search */}
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Try these popular searches:</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {["Women's Blouses", "Men's Jeans", "Women's Shoes", "Men's Jackets", "Women's Socks"].map(
                    (category) => (
                      <button
                        key={category}
                        onClick={() => handleSearch(category)}
                        className="px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-full text-sm transition-colors"
                      >
                        {category}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Voice Search and Image Upload Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voice Recording Section */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Mic className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Voice Search</h3>
                  </div>

                  <div className="text-center space-y-4">
                    {!isRecording ? (
                      <>
                        <p className="text-gray-400 text-sm mb-4">
                          Tap to start voice search. Describe what you're looking for.
                        </p>
                        <button
                          onClick={startRecording}
                          className="w-20 h-20 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 mx-auto"
                        >
                          <Mic className="w-8 h-8 text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-purple-400 font-medium">Listening...</p>
                        <div className="relative mx-auto w-20 h-20">
                          {/* Pulsing animation */}
                          <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute inset-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <button
                            onClick={stopRecording}
                            className="relative w-full h-full bg-purple-600 rounded-full flex items-center justify-center z-10"
                          >
                            <Mic className="w-8 h-8 text-white" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm">Recording: {formatTime(recordingTime)}</p>
                        <button
                          onClick={stopRecording}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Stop Recording
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Upload Section - Simplified with paperclip icon */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Paperclip className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Image Search</h3>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-gray-400 text-sm mb-4">Upload images to find similar products.</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 mx-auto"
                    >
                      <Paperclip className="w-8 h-8 text-white" />
                    </button>
                    <p className="text-xs text-gray-500">Supports JPEG, PNG, GIF, WebP (max 10MB each)</p>
                  </div>
                </div>
              </div>
            </div>

            {!user && (
              <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2">Get Personalized Recommendations</h3>
                <p className="text-gray-400 mb-4">
                  Sign up to save your search history and get AI-powered product suggestions tailored just for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => openModal("signup")}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => openModal("signin")}
                    className="px-6 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    Already have an account?
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Auth Modals */}
      <AuthModals isOpen={isOpen} mode={mode} onClose={closeModal} onModeChange={changeMode} />
    </>
  )
}
