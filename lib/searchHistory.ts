import { supabase } from "./supabase"
import { addSearchToHistory } from "./auth"
import type { SearchHistoryEntry, SearchResult } from "@/types/database"
import type { Product, SearchFilters } from "@/types"

export async function saveSearchToHistory(
  userId: string | null,
  query: string,
  filters: SearchFilters,
  products: Product[],
) {
  const searchEntry: SearchHistoryEntry = {
    id: crypto.randomUUID(),
    query,
    filters,
    results: products.map((product) => ({
      asin: product.asin,
      title: product.title,
      price: product.price,
      brand: product.brand,
      rating: product.avgRating,
      imageUrl: product.imageUrl,
      affiliateUrl: product.affiliateUrl,
    })),
    timestamp: new Date().toISOString(),
    resultCount: products.length,
  }

  if (userId) {
    // Save to database for authenticated users
    await addSearchToHistory(userId, searchEntry)
  } else {
    // Save to localStorage for anonymous users
    const existingHistory = getLocalSearchHistory()
    const updatedHistory = [searchEntry, ...existingHistory].slice(0, 20) // Keep last 20 searches
    localStorage.setItem("shopwizz_search_history", JSON.stringify(updatedHistory))
  }

  return searchEntry
}

export function getLocalSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return []

  try {
    const history = localStorage.getItem("shopwizz_search_history")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Error parsing search history:", error)
    return []
  }
}

export function clearLocalSearchHistory() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("shopwizz_search_history")
  }
}

export async function trackProductClick(userId: string | null, searchId: string, productAsin: string) {
  const timestamp = new Date().toISOString()

  if (userId) {
    // Update search history in database
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("search_history")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    const searchHistory = userData.search_history || []
    const updatedHistory = searchHistory.map((entry: SearchHistoryEntry) => {
      if (entry.id === searchId) {
        return {
          ...entry,
          results: entry.results.map((result: SearchResult) =>
            result.asin === productAsin ? { ...result, clickedAt: timestamp } : result,
          ),
        }
      }
      return entry
    })

    await supabase
      .from("users")
      .update({
        search_history: updatedHistory,
        updated_at: timestamp,
      })
      .eq("id", userId)
  } else {
    // Update localStorage for anonymous users
    const history = getLocalSearchHistory()
    const updatedHistory = history.map((entry) => {
      if (entry.id === searchId) {
        return {
          ...entry,
          results: entry.results.map((result) =>
            result.asin === productAsin ? { ...result, clickedAt: timestamp } : result,
          ),
        }
      }
      return entry
    })
    localStorage.setItem("shopwizz_search_history", JSON.stringify(updatedHistory))
  }
}
