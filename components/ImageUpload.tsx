"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileImage, AlertCircle, CheckCircle } from "lucide-react"

interface UploadedImage {
  file: File
  preview: string
  status: "uploading" | "success" | "error"
  id: string
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  onSearch: () => void
  maxImages?: number
  className?: string
}

export default function ImageUpload({ onImagesChange, onSearch, maxImages = 5, className = "" }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    const newImages: UploadedImage[] = []

    Array.from(files).forEach((file) => {
      if (uploadedImages.length + newImages.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`)
        return
      }

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

      newImages.push(newImage)
    })

    if (newImages.length > 0) {
      const updatedImages = [...uploadedImages, ...newImages]
      setUploadedImages(updatedImages)
      onImagesChange(updatedImages)

      // Simulate upload process
      newImages.forEach((image) => {
        setTimeout(
          () => {
            setUploadedImages((prev) => {
              const updated = prev.map((img) => (img.id === image.id ? { ...img, status: "success" as const } : img))
              onImagesChange(updated)
              return updated
            })
          },
          1000 + Math.random() * 2000,
        ) // Random delay between 1-3 seconds
      })
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      const updated = prev.filter((img) => img.id !== id)
      onImagesChange(updated)
      return updated
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

  const successfulImages = uploadedImages.filter((img) => img.status === "success")

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver ? "border-purple-400 bg-purple-900/20" : "border-gray-600 hover:border-gray-500"
        }`}
      >
        <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400 text-sm mb-3">Drag & drop images here, or click to browse</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadedImages.length >= maxImages}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Choose Images</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Supports JPEG, PNG, GIF, WebP (max 10MB each, {maxImages} images max)
        </p>
      </div>

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{uploadedImages.length} image(s) uploaded</span>
            <button
              onClick={onSearch}
              disabled={successfulImages.length === 0}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
            >
              Search Similar
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview || "/placeholder.svg"}
                  alt="Upload preview"
                  className="w-full h-20 object-cover rounded border border-gray-600"
                />

                {/* Status Indicator */}
                <div className="absolute top-1 left-1">
                  {image.status === "uploading" && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {image.status === "success" && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {image.status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>

                {/* File Name Tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {image.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
  )
}
