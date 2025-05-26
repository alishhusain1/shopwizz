"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Filter, Star, Save } from "lucide-react"
import { getCurrentUser, updateUserPreferences } from "@/lib/auth"
import type { SearchFilters } from "@/types"
import type { AuthUser } from "@/lib/auth"

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export default function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false) // Changed to false by default
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    price: false, // Changed to false by default
    brand: false, // Changed to false by default
    rating: false, // Changed to false by default
    shipping: false,
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Load user preferences if available
      if (currentUser?.preferences) {
        onFiltersChange(currentUser.preferences)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    }
    onFiltersChange(newFilters)
  }

  const savePreferences = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserPreferences(user.id, filters)
      // Update local user state
      setUser((prev) => (prev ? { ...prev, preferences: filters } : null))
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  // Dynamic price ranges based on current data
  const priceRanges = [
    { label: "Under $10", min: 0, max: 10 },
    { label: "$10 - $25", min: 10, max: 25 },
    { label: "$25 - $50", min: 25, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "Over $100", min: 100, max: undefined },
  ]

  const ratingOptions = [
    { label: "4+ Stars", value: 4, icon: "★★★★☆" },
    { label: "3+ Stars", value: 3, icon: "★★★☆☆" },
    { label: "2+ Stars", value: 2, icon: "★★☆☆☆" },
    { label: "1+ Stars", value: 1, icon: "★☆☆☆☆" },
  ]

  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${isExpanded ? "w-80" : "w-16"}`}>
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors"
        >
          <Filter className="w-5 h-5" />
          {isExpanded && <span className="font-medium">Filters</span>}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Price Range with Dynamic Slider */}
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full text-left text-white hover:text-purple-400 transition-colors mb-3"
            >
              <span className="font-medium">Price Range</span>
              {expandedSections.price ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {expandedSections.price && (
              <div className="space-y-4">
                {/* Custom Range Inputs */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={filters.priceMin || ""}
                      onChange={(e) => updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={filters.priceMax || ""}
                      onChange={(e) => updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Dynamic Range Slider */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Quick Select:</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={filters.priceMax || 200}
                        onChange={(e) => updateFilter("priceMax", Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>$0</span>
                        <span>$50</span>
                        <span>$100</span>
                        <span>$200+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset Price Ranges */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Popular Ranges:</label>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        updateFilter("priceMin", range.min)
                        updateFilter("priceMax", range.max)
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        filters.priceMin === range.min && filters.priceMax === range.max
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Customer Rating Selector */}
          <div>
            <button
              onClick={() => toggleSection("rating")}
              className="flex items-center justify-between w-full text-left text-white hover:text-purple-400 transition-colors mb-3"
            >
              <span className="font-medium">Customer Rating</span>
              {expandedSections.rating ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {expandedSections.rating && (
              <div className="space-y-3">
                {/* Star Rating Visual Selector */}
                <div className="space-y-2">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter("minRating", option.value)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded transition-colors ${
                        filters.minRating === option.value
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <span>{option.label}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < option.value ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Review Count Filter */}
                <div className="pt-3 border-t border-gray-700">
                  <label className="block text-sm text-gray-400 mb-2">Minimum Reviews</label>
                  <select
                    value={filters.minReviewCount || ""}
                    onChange={(e) =>
                      updateFilter("minReviewCount", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any number</option>
                    <option value="10">10+ reviews</option>
                    <option value="50">50+ reviews</option>
                    <option value="100">100+ reviews</option>
                    <option value="500">500+ reviews</option>
                    <option value="1000">1000+ reviews</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div>
            <button
              onClick={() => toggleSection("brand")}
              className="flex items-center justify-between w-full text-left text-white hover:text-purple-400 transition-colors mb-3"
            >
              <span className="font-medium">Brand</span>
              {expandedSections.brand ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {expandedSections.brand && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {[
                    "Amazon Essentials",
                    "Gildan",
                    "Fruit of the Loom",
                    "Hanes",
                    "Nike",
                    "Adidas",
                    "Under Armour",
                    "Champion",
                  ].map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.brandList?.includes(brand) || false}
                        onChange={(e) => {
                          const currentBrands = filters.brandList || []
                          const newBrands = e.target.checked
                            ? [...currentBrands, brand]
                            : currentBrands.filter((b) => b !== brand)
                          updateFilter("brandList", newBrands)
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Pickup */}
          <div>
            <button
              onClick={() => toggleSection("shipping")}
              className="flex items-center justify-between w-full text-left text-white hover:text-purple-400 transition-colors mb-3"
            >
              <span className="font-medium">Shipping & Pickup</span>
              {expandedSections.shipping ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {expandedSections.shipping && (
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.pickupAvailability || false}
                    onChange={(e) => updateFilter("pickupAvailability", e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Pickup Available</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Maximum Shipping Time</label>
                  <select
                    value={filters.maxShippingDays || ""}
                    onChange={(e) =>
                      updateFilter("maxShippingDays", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any shipping time</option>
                    <option value="1">Same day</option>
                    <option value="2">1-2 days</option>
                    <option value="7">Within a week</option>
                    <option value="14">Within 2 weeks</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            {user && (
              <button
                onClick={savePreferences}
                disabled={isSaving}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
              </button>
            )}

            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Clear All Filters
            </button>

            {!user && (
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2">Save your preferences?</p>
                <button className="text-purple-400 hover:text-purple-300 text-sm underline">Sign up</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for range slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
      `}</style>
    </div>
  )
}
