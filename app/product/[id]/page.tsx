"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, ExternalLink, Heart, Share2, Info } from "lucide-react"
import Header from "@/components/Header"
import type { Product } from "@/types"
import { callChatGPT } from "@/lib/api"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError] = useState<string>("")

  useEffect(() => {
    // Simulate fetching product details
    const mockProduct: Product = {
      product_id: params.id as string,
      title: "Global Brand Men's Slim-Fit Crewneck T-Shirt 2-Pack",
      prices: ["$10.32", "$12.90"],
      conditions: ["New"],
      typical_prices: {
        low: "$10.32",
        high: "$12.90",
        shown_price: "$10.32"
      },
      reviews: 6,
      rating: 5.0,
      extensions: ["Best Value Pack"],
      description: "A global brand's short sleeve T-Shirts, slim-fit, crewneck, pack of 2.",
      media: [
        { type: "image", link: "/placeholder.svg?height=500&width=500" },
        { type: "image", link: "/placeholder.svg?height=500&width=500" },
        { type: "image", link: "/placeholder.svg?height=500&width=500" },
        { type: "image", link: "/placeholder.svg?height=500&width=500" }
      ],
      sizes: {
        "M": {
          link: "https://example.com/product/123?size=M",
          product_id: "123-M",
          serpapi_link: "https://serpapi.com/product/123-M",
          selected: true
        },
        "L": {
          link: "https://example.com/product/123?size=L",
          product_id: "123-L",
          serpapi_link: "https://serpapi.com/product/123-L",
          selected: false
        }
      },
      highlights: ["Slim fit design", "Soft cotton blend", "2-pack value", "Tagless comfort"],
      features: [
        { name: "Slim fit design", text: "Modern slim fit for versatile styling." },
        { name: "Soft cotton blend", text: "Comfortable and breathable fabric." },
        { name: "2-pack value", text: "Great value for money." },
        { name: "Tagless comfort", text: "No itchy tags for all-day comfort." }
      ]
    }
    setProduct(mockProduct)

    // AI summary and analysis generation
    async function fetchAISummaryAndAnalysis() {
      setAiLoading(true)
      setAiError("")
      try {
        const prompt = `You are an expert product analyst. Given the following product details, generate two outputs:\n1. A concise, persuasive summary (max 100 words) for the section 'Why you might like this'.\n2. A short analysis of what verified buyers are saying, grouped by themes (e.g., Shrinkage, Neckline Style, Fit), for the section 'What people are saying'.\n\nProduct details: ${JSON.stringify(mockProduct)}`
        const messages = [
          { role: "system" as "assistant", content: "You are a helpful AI shopping assistant." },
          { role: "user" as "user", content: prompt },
        ]
        const response = await callChatGPT(messages)
        const content = response.choices?.[0]?.message?.content || ""
        const [summary, analysis] = content.split(/\n\n|\n(?=What people are saying)/i)
        setAiSummary(summary?.replace(/^Why you might like this:/i, "").trim() || "")
        setAiAnalysis(analysis?.replace(/^What people are saying:/i, "").trim() || "")
      } catch {
        setAiError("Failed to generate AI summary. Showing default content.")
        setAiSummary("A global brand's slim-fit crewneck T-shirt 2-pack offers comfort, value, and style for everyday wear.")
        setAiAnalysis(
          `Fit: Most users appreciate the slim fit and comfort.\n\nValue: Great value for a 2-pack.\n\nFabric: Soft and breathable.`
        )
      } finally {
        setAiLoading(false)
      }
    }
    fetchAISummaryAndAnalysis()
  }, [params.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
      />
    ))
  }

  const images = product.media.filter(m => m.type === "image").map(m => m.link)
  const selectedSize = Object.values(product.sizes).find(s => s.selected) || Object.values(product.sizes)[0]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to results</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={images[selectedImage] || "/placeholder.svg?height=500&width=500"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-purple-500" : "border-gray-700"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
                <span className="text-yellow-400 font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviews})</span>
              </div>
              {product.extensions.length > 0 && <p className="text-gray-400">{product.extensions[0]}</p>}
            </div>

            {/* Price and Buy Section */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{product.typical_prices.shown_price}</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <a
                href={selectedSize?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Buy Now</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            {/* AI Analysis */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Why you might like this</h3>
              {aiLoading ? (
                <div className="text-gray-400">Generating summary...</div>
              ) : aiError ? (
                <div className="text-red-400">{aiError}</div>
              ) : (
                <div className="text-gray-300 whitespace-pre-line">{aiSummary}</div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What people are saying</h3>
              {aiLoading ? (
                <div className="text-gray-400">Generating analysis...</div>
              ) : aiError ? (
                <div className="text-red-400">{aiError}</div>
              ) : (
                <div className="text-gray-300 whitespace-pre-line">{aiAnalysis}</div>
              )}
            </div>

            {/* Key Features */}
            {product.features.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{feature.name}: {feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Options */}
            {Object.keys(product.sizes).length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Available Options</h3>
                <div className="space-y-3">
                  {Object.entries(product.sizes).map(([size, option]) => (
                    <div key={option.product_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">{size}</span>
                      <a
                        href={option.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:underline"
                      >
                        {option.link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
