"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SearchResultsLayout from "@/components/SearchResultsLayout"
import { callChatEdgeFunction, callProductSearch } from "@/lib/api"

// Custom hook for persistent state synced with localStorage
function usePersistentState<T>(key: string, defaultValue: T, reviver?: (value: any) => T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(reviver ? reviver(parsed) : parsed);
        } catch {}
      }
    }
    // eslint-disable-next-line
  }, [key]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);
  return [state, setState];
}

export default function ShopPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = usePersistentState<string>(
    'shopwizz_search_query',
    'Show me trending products'
  );
  const [initialChatMessages, setInitialChatMessages] = usePersistentState<any[]>(
    'shopwizz_chat_messages',
    [],
    (msgs) => Array.isArray(msgs) ? msgs.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })) : []
  );
  const [initialProducts, setInitialProducts] = usePersistentState<any[]>(
    'shopwizz_products',
    []
  );
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const router = useRouter()

  // Hydration guard
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // On first load, fetch AI summary and products if no saved state
  useEffect(() => {
    if (!isHydrated) return;
    if (initialChatMessages.length === 0 && initialProducts.length === 0) {
      async function fetchInitial() {
        setIsInitialLoading(true)
        try {
          const chatRes = await callChatEdgeFunction({ kind: "text", text: `Summarize this product search intent for a user in plain English: ${searchQuery}` })
          const aiMsg = {
            id: Date.now().toString(),
            type: "ai",
            content: chatRes.reply || chatRes.choices?.[0]?.message?.content || "",
            timestamp: new Date(),
          }
          setInitialChatMessages(prev => [...prev, aiMsg])
          const products = await callProductSearch(searchQuery)
          setInitialProducts(products)
        } catch (err) {
          setInitialChatMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              content: "Sorry, something went wrong.",
              timestamp: new Date(),
            },
          ])
          setInitialProducts([])
        } finally {
          setIsInitialLoading(false)
        }
      }
      fetchInitial()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  const handleSearch = async (query: string) => {
    console.log("SEARCH QUERY:", query); // Debug log to verify query value
    setSearchQuery(query)
    setIsInitialLoading(true)
    try {
      let chatRes
      if (query.trim().toLowerCase() === "show me trending products") {
        chatRes = await callChatEdgeFunction({ kind: "text", text: `Summarize this product search intent for a user in plain English: ${query}` })
      } else {
        chatRes = await callChatEdgeFunction({ kind: "text", text: query })
      }
      const aiMsg = {
        id: Date.now().toString(),
        type: "ai",
        content: chatRes.reply || chatRes.choices?.[0]?.message?.content || "",
        timestamp: new Date(),
      }
      setInitialChatMessages(prev => [...prev, aiMsg])
      const products = await callProductSearch(query)
      setInitialProducts(products)
    } catch (err) {
      setInitialChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: "Sorry, something went wrong.",
          timestamp: new Date(),
        },
      ])
      setInitialProducts([])
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleProductClick = (product: any) => {
    router.push(`/product/${product.product_id}?keywords=${encodeURIComponent(searchQuery)}`)
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <SearchResultsLayout
      searchQuery={searchQuery}
      onProductClick={handleProductClick}
      onNewSearch={handleSearch}
      initialChatMessages={initialChatMessages}
      initialProducts={initialProducts}
    />
  )
} 