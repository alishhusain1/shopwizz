export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: "user" | "admin" | "super_admin"
          preferences: UserPreferences
          search_history: SearchHistoryEntry[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: "user" | "admin" | "super_admin"
          preferences?: UserPreferences
          search_history?: SearchHistoryEntry[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: "user" | "admin" | "super_admin"
          preferences?: UserPreferences
          search_history?: SearchHistoryEntry[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface UserPreferences {
  priceMin?: number
  priceMax?: number
  brandList?: string[]
  minRating?: number
  minReviewCount?: number
  maxShippingDays?: number
  pickupAvailability?: boolean
  theme?: "dark" | "light"
  notifications?: {
    email: boolean
    push: boolean
    priceAlerts: boolean
  }
}

export interface SearchHistoryEntry {
  id: string
  query: string
  filters: UserPreferences
  results: SearchResult[]
  timestamp: string
  resultCount: number
}

export interface SearchResult {
  product_id: string;
  title: string;
  price: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  buyUrl: string;
  clickedAt?: string;
}
