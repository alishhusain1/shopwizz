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
      asin: params.id as string,
      title: "Amazon Essentials Men's Slim-Fit Crewneck T-Shirt 2-Pack",
      imageUrl: "/placeholder.svg?height=500&width=500",
      price: 10.32,
      brand: "Amazon Essentials",
      reviewCount: 6,
      avgRating: 5.0,
      affiliateUrl: "https://amazon.com/dp/B077Z8NQRX?tag=shopwizz-20",
      aiRating: 5.0,
      whyBuy:
        "The Amazon Essentials Men's Slim-Fit Crewneck T-Shirt 2-Pack offers a budget-friendly option for those seeking comfortable, everyday wear. Its slim fit and lightweight fabric make it suitable for layering or standalone use, and the tagless design enhances comfort.",
      badge: "Best Value Pack",
      features: ["Slim fit design", "Soft cotton blend", "2-pack value", "Tagless comfort"],
      pros: ["Great value for money", "Comfortable fit", "Quality fabric", "Versatile styling"],
      cons: ["Limited color options", "Slim fit may not suit all body types", "May shrink after washing"],
      images: [
        "/placeholder.svg?height=500&width=500",
        "/placeholder.svg?height=500&width=500",
        "/placeholder.svg?height=500&width=500",
        "/placeholder.svg?height=500&width=500",
      ],
      description: "Amazon Essentials Men's Short Sleeve T-Shirts, Slim-Fit, Crewneck, Pack of 2",
      shipping: "$6.99 delivery, 30-day returns",
      variants: [
        { price: 10.32, description: "Amazon Essentials Men's Slim-Fit Crewneck T-Shirt 2-Pack" },
        { price: 12.9, description: "Amazon Essentials Men's Slim-Fit Crewneck T-Shirt 2-Pack" },
      ],
    }
    setProduct(mockProduct)

    // AI summary and analysis generation
    async function fetchAISummaryAndAnalysis() {
      setAiLoading(true)
      setAiError("")
      try {
        const prompt = `You are an expert product analyst. Given the following product details, generate two outputs:\n1. A concise, persuasive summary (max 100 words) for the section 'Why you might like this'.\n2. A short analysis of what verified buyers are saying, grouped by themes (e.g., Shrinkage, Neckline Style, Fit), for the section 'What people are saying'.\n\nProduct details: Title: ${mockProduct.title}, Brand: ${mockProduct.brand}, Price: $${mockProduct.price}, Features: ${mockProduct.features?.join(", ")}, Pros: ${mockProduct.pros?.join(", ")}, Cons: ${mockProduct.cons?.join(", ")}, Description: ${mockProduct.description}`
        const messages = [
          { role: "system" as "assistant", content: "You are a helpful AI shopping assistant." },
          { role: "user" as "user", content: prompt },
        ]
        const response = await callChatGPT(messages)
        // Expecting the AI to return a response with two sections separated by a delimiter
        // e.g., 'Why you might like this: ...\n\nWhat people are saying: ...'
        const content = response.choices?.[0]?.message?.content || ""
        const [summary, analysis] = content.split(/\n\n|\n(?=What people are saying)/i)
        setAiSummary(summary?.replace(/^Why you might like this:/i, "").trim() || "")
        setAiAnalysis(analysis?.replace(/^What people are saying:/i, "").trim() || "")
      } catch (err) {
        setAiError("Failed to generate AI summary. Showing default content.")
        setAiSummary(mockProduct.whyBuy)
        setAiAnalysis(
          `Shrinkage: Approximately 30% of users reported minimal shrinkage after washing, with some stating that the shirts shrunk down a size.\n\nNeckline Style: 67% of users praised the neckline style, but 33% found it too tight or uncomfortable after washing.\n\nFit: 70% of users appreciated the slim fit, noting it was suitable for those with athletic builds.`
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
                src={product.images?.[selectedImage] || product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
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
                <div className="flex items-center space-x-1">{renderStars(product.avgRating)}</div>
                <span className="text-yellow-400 font-medium">{product.avgRating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviewCount})</span>
              </div>
              <p className="text-gray-400">{product.brand}</p>
            </div>

            {/* Price and Buy Section */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">${product.price.toFixed(2)}</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400">{product.shipping}</p>

              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Buy Now on Amazon</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            {/* AI Analysis */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Why you might like this</h3>
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {aiLoading ? (
                <p className="text-gray-400 animate-pulse">Generating summary...</p>
              ) : aiError ? (
                <p className="text-red-400">{aiError}</p>
              ) : (
                <p className="text-gray-300">{aiSummary}</p>
              )}

              {showAnalysis && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div>
                    <h4 className="font-medium text-white mb-2">What people are saying</h4>
                    {aiLoading ? (
                      <p className="text-gray-400 animate-pulse">Generating analysis...</p>
                    ) : (
                      <div className="space-y-3 text-sm text-gray-300 whitespace-pre-line">{aiAnalysis}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {product.features && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variants */}
            {product.variants && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Available Options</h3>
                <div className="space-y-3">
                  {product.variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">{variant.description}</span>
                      <span className="text-white font-medium">${variant.price.toFixed(2)}</span>
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
