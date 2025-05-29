"use client"

import { useState, useEffect, useRef } from "react"
import Header from "./Header"
import FilterSidebar from "./FilterSidebar"
import ChatInterface from "./ChatInterface"
import ProductGrid from "./ProductGrid"
import type { Product, SearchFilters } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { saveSearchToHistory } from "@/lib/searchHistory"
import EmailVerificationBanner from "./EmailVerificationBanner"
import { useEmailVerification } from "@/hooks/useEmailVerification"
import { callChatGPT, callChatEdgeFunction, callProductSearch } from "@/lib/api"

// Simple in-memory cache for recent queries (per session)
const productCache: { [key: string]: Product[] } = {}
const cacheOrder: string[] = []
const MAX_CACHE = 10

interface SearchResultsLayoutProps {
  searchQuery: string
  onProductClick: (product: Product) => void
  onNewSearch: (query: string) => void
  initialChatMessages?: {
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
  }[]
  initialProducts?: Product[]
}

// Add a type for chat input
type ChatInput = string | { kind: "text"; text: string } | { kind: "image"; image: string; text?: string };

export default function SearchResultsLayout({ searchQuery, onProductClick, onNewSearch, initialChatMessages, initialProducts }: SearchResultsLayoutProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
    suggestions?: any[];
  }[]>(
    initialChatMessages || [
      {
        id: "1",
        type: "ai",
        content: `Here are some ${searchQuery.toLowerCase()} under $20, available for purchase:`,
        timestamp: new Date(),
      },
    ]
  )
  const initialProductsUsed = useRef(false)

  const { user } = useAuth()
  const { needsVerification } = useEmailVerification()

  useEffect(() => {
    // Only skip fetch on first mount if initialProducts is provided
    if (initialProducts && !initialProductsUsed.current) {
      initialProductsUsed.current = true
      return
    }
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
      let fetchedProducts: Product[] = await callProductSearch(searchQuery, filters)
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

  // Update handleChatMessage to accept ChatInput
  const handleChatMessage = async (message: ChatInput) => {
    let newMessage: any;
    let userQuery = "";
    if (typeof message === "string") {
      newMessage = {
        id: Date.now().toString(),
        type: "user" as const,
        content: message,
        timestamp: new Date(),
      };
      userQuery = message;
    } else if (message.kind === "text") {
      newMessage = {
        id: Date.now().toString(),
        type: "user" as const,
        content: message.text,
        timestamp: new Date(),
      };
      userQuery = message.text;
    } else if (message.kind === "image") {
      newMessage = {
        id: Date.now().toString(),
        type: "user" as const,
        content: message.text || "[Image]",
        timestamp: new Date(),
        image: message.image, // Optionally store image for preview
      };
      userQuery = message.text || "";
    }
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      // Prepare payload for backend
      let rawInput: any = {};
      if (typeof message === "string") {
        rawInput = { kind: "text", text: message };
      } else if (message.kind === "text") {
        rawInput = { kind: "text", text: message.text };
      } else if (message.kind === "image") {
        rawInput = { kind: "image", image: message.image };
        if (message.text) rawInput.text = message.text;
      }
      // Build chat memory (last 10 messages)
      const systemPrompt = { role: "system", content: "You are a helpful AI shopping assistant." };
      const history = chatMessages.slice(-10).map((msg) =>
        msg.type === "user"
          ? { role: "user", content: msg.content }
          : { role: "assistant", content: msg.content }
      );
      const messages = [systemPrompt, ...history, { role: "user", content: newMessage.content }];
      // Call the Supabase Edge Function for chat (Vision model for images)
      const response = await callChatEdgeFunction(rawInput, messages);
      let aiContent = response.reply || response.choices?.[0]?.message?.content || "";
      // --- BEGIN PATCH: Robust JSON intent parsing ---
      function extractJsonIntent(aiReply: string) {
        try {
          // Find the first '{' and try to parse until the matching '}'
          const start = aiReply.indexOf('{');
          if (start === -1) return null;

          // Find the matching closing brace for the JSON object
          let openBraces = 0;
          let end = -1;
          for (let i = start; i < aiReply.length; i++) {
            if (aiReply[i] === '{') openBraces++;
            if (aiReply[i] === '}') openBraces--;
            if (openBraces === 0) {
              end = i + 1;
              break;
            }
          }
          if (end === -1) return null;

          const jsonStr = aiReply.slice(start, end);
          return JSON.parse(jsonStr);
        } catch (e) {
          console.error('Failed to parse AI intent:', aiReply, e);
        }
        return null;
      }
      const aiIntent = extractJsonIntent(aiContent);
      let productResults: Product[] = [];
      let searchQueryForProducts = userQuery;
      let aiMessageObj: { id: string; type: "user" | "ai"; content: string; timestamp: Date; suggestions?: any[] };
      if (aiIntent && aiIntent.keywords) {
        searchQueryForProducts = aiIntent.keywords;
        // Call chat edge function to generate a user-friendly summary
        const summaryPrompt = `Summarize this product search intent for a user in plain English: ${JSON.stringify(aiIntent)}`;
        const summaryResponse = await callChatEdgeFunction({ kind: "text", text: summaryPrompt });
        const summaryText = summaryResponse.reply || summaryResponse.choices?.[0]?.message?.content || "Here are some options I found!";
        aiMessageObj = {
          id: (Date.now() + 1).toString(),
          type: "ai" as const,
          content: summaryText,
          timestamp: new Date(),
          suggestions: aiIntent.suggestions || []
        };
        setChatMessages((prev) => [...prev, aiMessageObj]);
      } else {
        // Log the full AI reply for debugging if parsing fails
        console.warn('AI did not return a valid JSON intent. Full reply:', aiContent);
        aiMessageObj = {
          id: (Date.now() + 1).toString(),
          type: "ai" as const,
          content: aiContent,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiMessageObj]);
      }
      if (searchQueryForProducts && searchQueryForProducts.trim().length > 0) {
        setIsLoading(true);
        try {
          productResults = await callProductSearch(searchQueryForProducts);
          setProducts(productResults);
        } catch (err) {
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: "Sorry, something went wrong.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Find the latest AI message (summary)
  const latestAiMessage = [...chatMessages].reverse().find(m => m.type === "ai") || null;

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
              aiMessage={latestAiMessage}
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
