"use client"

import { useState, useEffect } from "react"
import Header from "./Header"
import FilterSidebar from "./FilterSidebar"
import ChatInterface from "./ChatInterface"
import ProductGrid from "./ProductGrid"
import type { Product, SearchFilters } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { saveSearchToHistory } from "@/lib/searchHistory"
import EmailVerificationBanner from "./EmailVerificationBanner"
import { useEmailVerification } from "@/hooks/useEmailVerification"
import { callChatGPT } from "@/lib/api"

// Simple in-memory cache for recent queries (per session)
const productCache: { [key: string]: Product[] } = {}
const cacheOrder: string[] = []
const MAX_CACHE = 10

interface SearchResultsLayoutProps {
  searchQuery: string
  onProductClick: (productId: string) => void
  onNewSearch: (query: string) => void
}

export default function SearchResultsLayout({ searchQuery, onProductClick, onNewSearch }: SearchResultsLayoutProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
  }[]>([
    {
      id: "1",
      type: "ai",
      content: `Here are some ${searchQuery.toLowerCase()} under $20, available for purchase:`,
      timestamp: new Date(),
    },
  ])

  const { user } = useAuth()
  const { needsVerification } = useEmailVerification()

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, filters, user])

  const fetchProducts = async () => {
    setIsLoading(true)
    const cacheKey = JSON.stringify({ searchQuery, filters })
    if (productCache[cacheKey]) {
      setProducts(productCache[cacheKey])
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(
        "https://aoiftyzquultpxzphdfp.supabase.co/functions/v1/serpapi-product-search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Optionally: "Authorization": `Bearer ${user?.access_token}`
          },
          body: JSON.stringify({
            query: searchQuery,
            filters,
          }),
        }
      )
      const data = await res.json()
      let fetchedProducts: Product[] = data.products || []
      // Apply filters client-side if not supported by Edge Function
      if (filters.priceMin || filters.priceMax) {
        fetchedProducts = fetchedProducts.filter(p => {
          const price = parseFloat((p.typical_prices.shown_price || p.prices[0] || "0").replace(/[^\d.]/g, ""))
          if (filters.priceMin && price < filters.priceMin) return false
          if (filters.priceMax && price > filters.priceMax) return false
          return true
        })
      }
      if (filters.brandList && filters.brandList.length > 0) {
        fetchedProducts = fetchedProducts.filter(p =>
          filters.brandList!.some(brand => p.title.toLowerCase().includes(brand.toLowerCase()))
        )
      }
      if (filters.minRating) {
        fetchedProducts = fetchedProducts.filter(p => p.rating >= filters.minRating!)
      }
      if (filters.minReviewCount) {
        fetchedProducts = fetchedProducts.filter(p => p.reviews >= filters.minReviewCount!)
      }
      setProducts(fetchedProducts)
      // Cache result
      productCache[cacheKey] = fetchedProducts
      cacheOrder.push(cacheKey)
      if (cacheOrder.length > MAX_CACHE) {
        const oldest = cacheOrder.shift()
        if (oldest) delete productCache[oldest]
      }
      setIsLoading(false)
      // Save search to history
      if (fetchedProducts.length > 0) {
        await saveSearchToHistory(user?.id || null, searchQuery, filters, fetchedProducts)
      }
    } catch (err) {
      setProducts([])
      setIsLoading(false)
    }
  }

  const handleChatMessage = async (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: message,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, newMessage])

    try {
      const chatHistory = [...chatMessages, newMessage].map((m) => ({
        role: m.type === "user" ? "user" as const : "assistant" as const,
        content: m.content,
      }))
      const response = await callChatGPT(chatHistory)
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai" as const,
        content: response.choices[0].message.content,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: "Sorry, something went wrong.",
          timestamp: new Date(),
        },
      ])
    }
  }

  // If user is logged in, show only chat interface
  if (user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        {needsVerification && user && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <EmailVerificationBanner userEmail={user.email} />
          </div>
        )}
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-4xl mx-auto p-6">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleChatMessage}
              onNewSearch={onNewSearch}
              isFullScreen={true}
            />
          </div>
        </div>
      </div>
    )
  }

  // For non-logged in users, show the full interface
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Product Grid */}
          <div className="flex-1 p-6">
            <ProductGrid
              products={products}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onProductClick={onProductClick}
              chatMessages={chatMessages}
            />
          </div>

          {/* Right Sidebar - Chat */}
          <div className="w-96 border-l border-gray-700">
            <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} onNewSearch={onNewSearch} />
          </div>
        </div>
      </div>
    </div>
  )
}
