export interface ProductMedia {
  type: string; // e.g., "image", "video"
  link: string;
}

export interface ProductFeature {
  name: string;
  text: string;
}

export interface ProductSizeOption {
  link: string;
  product_id: string;
  serpapi_link: string;
  selected: boolean;
}

export interface Product {
  product_id: string;
  title: string;
  prices: string[];
  conditions: string[];
  typical_prices: {
    low: string;
    high: string;
    shown_price: string;
  };
  reviews: number;
  rating: number;
  extensions: string[];
  description: string;
  media: ProductMedia[];
  sizes: Record<string, ProductSizeOption>;
  highlights: string[];
  features: ProductFeature[];
}

export interface SearchFilters {
  priceMin?: number
  priceMax?: number
  brandList?: string[]
  minRating?: number
  minReviewCount?: number
  maxShippingDays?: number
  pickupAvailability?: boolean
}

export interface User {
  id: string
  email: string
  role: "user" | "admin" | "super_admin"
  preferences: SearchFilters
  searchHistory: SearchQuery[]
  createdAt: string
  updatedAt: string
}

export interface SearchQuery {
  id: string
  textPrompt?: string
  voiceBlob?: Blob
  imageFile?: File
  filters: SearchFilters
  timestamp: string
}
