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

    // Simulate API call with realistic data
    setTimeout(async () => {
      const mockProducts: Product[] = [
        {
          asin: "B08N5WRWNW",
          title: "Gildan Men's Ultra Cotton T-Shirt",
          imageUrl: "/placeholder.svg?height=300&width=300",
          price: 9.0,
          brand: "Gildan",
          reviewCount: 14000,
          avgRating: 4.8,
          affiliateUrl: "https://amazon.com/dp/B08N5WRWNW?tag=shopwizz-20",
          aiRating: 4.8,
          whyBuy: "A budget-friendly option made from 100% preshrunk cotton, known for its durability and comfort.",
          badge: "Budget Pick",
          features: ["100% preshrunk cotton", "Durable construction", "Classic fit"],
          pros: ["Excellent value", "Comfortable fabric", "Wide size range"],
          cons: ["Basic design", "May shrink slightly"],
        },
        {
          asin: "B077Z8NQRX",
          title: "Amazon Essentials Men's Slim-Fit Crewneck T-Shirt 2-Pack",
          imageUrl: "/placeholder.svg?height=300&width=300",
          price: 10.32,
          brand: "Amazon Essentials",
          reviewCount: 6,
          avgRating: 5.0,
          affiliateUrl: "https://amazon.com/dp/B077Z8NQRX?tag=shopwizz-20",
          aiRating: 5.0,
          whyBuy: "Offers a slim fit and soft fabric, providing great value with two shirts under $20.",
          badge: "Best Value Pack",
          features: ["Slim fit design", "Soft cotton blend", "2-pack value"],
          pros: ["Great value", "Comfortable fit", "Quality fabric"],
          cons: ["Limited color options", "Slim fit may not suit all"],
        },
        {
          asin: "B01LTHKZPQ",
          title: "Fruit of the Loom Men's 6-Pack Stay Tucked Crew T-Shirts",
          imageUrl: "/placeholder.svg?height=300&width=300",
          price: 18.48,
          brand: "Fruit of the Loom",
          reviewCount: 6,
          avgRating: 5.0,
          affiliateUrl: "https://amazon.com/dp/B01LTHKZPQ?tag=shopwizz-20",
          aiRating: 5.0,
          whyBuy: "Features a stay-tucked design and tag-free comfort, making it ideal for layering or daily wear.",
          badge: "Stay-Tucked Design",
          features: ["Stay-tucked design", "Tag-free comfort", "6-pack value"],
          pros: ["Stays tucked in", "Comfortable", "Great bulk value"],
          cons: ["Higher price point", "Limited individual sizing"],
        },
        {
          asin: "B08XQJK9MN",
          title: "#22 Oversize Fit Tee - White",
          imageUrl: "/placeholder.svg?height=300&width=300",
          price: 11.77,
          brand: "YPB BLANK",
          reviewCount: 250,
          avgRating: 4.5,
          affiliateUrl: "https://amazon.com/dp/B08XQJK9MN?tag=shopwizz-20",
          aiRating: 4.6,
          whyBuy: "An oversized fit tee made from 100% cotton, offering a heavy-weight feel at 250gsm.",
          badge: "Oversized Fit",
          features: ["Oversized fit", "Heavy-weight cotton", "250gsm fabric"],
          pros: ["Trendy oversized fit", "Quality fabric", "Good weight"],
          cons: ["Limited color options", "May be too oversized for some"],
        },
      ]
      setProducts(mockProducts)
      setIsLoading(false)

      // Save search to history
      if (products.length > 0) {
        await saveSearchToHistory(user?.id || null, searchQuery, filters, products)
      }
    }, 1000)
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
