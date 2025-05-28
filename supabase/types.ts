export type QueryIntent = {
  raw: string;
  keywords: string;
  filters?: {
    color?: string;
    size?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string[];
    minRating?: number;
    minReviewCount?: number;
    otherAttrs?: Record<string, string>;
  };
};

export type ProductItem = {
  title: string;
  imageUrl: string;
  price: number;
  currency: "USD";
  brand?: string;
  rating?: number;
  reviewCount?: number;
  affiliateUrl: string;
  sourceDomain: string;
}; 