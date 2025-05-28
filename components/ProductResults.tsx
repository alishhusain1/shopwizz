"use client"

import { Star, ExternalLink } from "lucide-react"
import type { Product } from "@/types"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface ProductGridProps {
  products: Product[]
  searchQuery: string
  isLoading: boolean
  onProductClick: (productId: string) => void
  chatMessages: Message[]
}

export default function ProductGrid({
  products,
  searchQuery,
  isLoading,
  onProductClick,
  chatMessages,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="aspect-square bg-gray-700 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const aiMessage = chatMessages.find((msg) => msg.type === "ai")

  return (
    <div className="space-y-6">
      {/* AI Response Header */}
      {aiMessage && (
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300">{aiMessage.content}</p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} onClick={() => onProductClick(product.product_id)} />
        ))}
      </div>

      {/* Top Selections Analysis */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">Top Selections:</h3>
        <div className="space-y-3">
          {products.slice(0, 3).map((product, index) => (
            <div key={product.product_id} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>
              <div>
                <h4 className="text-white font-medium">{product.title}:</h4>
                <p className="text-gray-300 text-sm">{
                  (Array.isArray(product.highlights) && product.highlights.length > 0 && product.highlights[0]) ||
                  (Array.isArray(product.features) && product.features.length > 0 && product.features[0]?.text) ||
                  ""
                }</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            These options provide a range of fits and features to suit various preferences while staying within your
            budget.
          </p>
        </div>
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onClick: () => void
}

function ProductCard({ product, onClick }: ProductCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
      />
    ))
  }

  const image = Array.isArray(product.media) && product.media.length > 0 && product.media[0]?.link ? product.media[0].link : "/placeholder.svg"
  const price = product?.typical_prices?.shown_price || (Array.isArray(product.prices) && product.prices.length > 0 && product.prices[0]) || "N/A"
  const reviews = typeof product.reviews === "number" ? product.reviews : 0
  const rating = typeof product.rating === "number" ? product.rating : 0
  const buyLink = product.sizes && Object.values(product.sizes)[0]?.link ? Object.values(product.sizes)[0].link : "#"
  const badge = (Array.isArray(product.extensions) && product.extensions.length > 0 && product.extensions[0]) || (Array.isArray(product.highlights) && product.highlights.length > 0 && product.highlights[0]) || null

  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">{badge}</span>
          </div>
        )}
        <div className="aspect-square relative overflow-hidden">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-medium text-white line-clamp-2 leading-tight">{product.title}</h3>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">{renderStars(rating)}</div>
          <span className="text-sm text-yellow-400 font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-white">{price}</span>
          </div>

          <button
            onClick={e => {
              e.stopPropagation()
              window.open(buyLink, "_blank")
            }}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>Buy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
