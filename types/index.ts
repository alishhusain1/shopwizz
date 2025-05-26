export interface Product {
  asin: string
  title: string
  imageUrl: string
  price: number
  brand: string
  reviewCount: number
  avgRating: number
  affiliateUrl: string
  aiRating: number
  whyBuy: string
  badge?: string
  features?: string[]
  pros?: string[]
  cons?: string[]
  images?: string[]
  description?: string
  shipping?: string
  variants?: Array<{
    price: number
    description: string
  }>
}

export interface SearchFilters {
  priceMin?: number
  priceMax?: number
  brandList?: string[]
  minRating?: number
  minReviewCount?: number
  maxShippingDays?: number
  pickupAvailability?: boolean
}

export interface User {
  id: string
  email: string
  role: "user" | "admin" | "super_admin"
  preferences: SearchFilters
  searchHistory: SearchQuery[]
  createdAt: string
  updatedAt: string
}

export interface SearchQuery {
  id: string
  textPrompt?: string
  voiceBlob?: Blob
  imageFile?: File
  filters: SearchFilters
  timestamp: string
}
