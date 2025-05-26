"use client"

import ProductResults from "./ProductResults"
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

export default function ProductGrid(props: ProductGridProps) {
  return <ProductResults {...props} />
}
