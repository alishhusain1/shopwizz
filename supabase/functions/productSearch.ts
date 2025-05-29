import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import type { ProductItem, QueryIntent } from "./chat/lib/types.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req: any) => {
  // Logging incoming request
  console.log(`[${new Date().toISOString()}] Incoming /productSearch request`);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    // Support GET for fetching a single product by product_id
    if (req.method === "GET") {
      const url = new URL(req.url);
      const productId = url.searchParams.get("product_id");
      const keywords = url.searchParams.get("keywords") || "";
      if (!productId || !keywords) {
        return new Response(JSON.stringify({ error: "Missing product_id or keywords" }), { status: 400, headers: corsHeaders });
      }
      // Fetch products for the given keywords
      const serpapiKey = Deno.env.get("SERPAPI_KEY");
      if (!serpapiKey) throw new Error("Missing SerpAPI key");
      const serpUrl = new URL("https://serpapi.com/search.json");
      serpUrl.searchParams.set("engine", "google_shopping");
      serpUrl.searchParams.set("q", keywords);
      serpUrl.searchParams.set("api_key", serpapiKey);
      serpUrl.searchParams.set("gl", "us");
      serpUrl.searchParams.set("hl", "en");
      const serpRes = await fetch(serpUrl.toString());
      if (!serpRes.ok) {
        const errText = await serpRes.text();
        return new Response(JSON.stringify({ error: "SerpAPI error", details: errText }), { status: 502, headers: corsHeaders });
      }
      const serpData = await serpRes.json();
      const results = serpData.shopping_results || [];
      let products = results
        .filter((item: any) => item.extracted_price && item.thumbnail)
        .map((item: any, idx: number) => ({
          product_id:
            item.product_id ||
            item.id ||
            `${item.title?.replace(/[^a-zA-Z0-9]/g, "_") || "untitled"}_${item.extracted_price || ""}_${idx}`,
          title: item.title || "Untitled Product",
          prices: [item.extracted_price ? `$${item.extracted_price}` : "N/A"],
          conditions: item.conditions || [],
          typical_prices: {
            low: item.extracted_price ? `$${item.extracted_price}` : "N/A",
            high: item.extracted_price ? `$${item.extracted_price}` : "N/A",
            shown_price: item.extracted_price ? `$${item.extracted_price}` : "N/A"
          },
          reviews: item.reviews || 0,
          rating: item.rating || 0,
          extensions: item.brand ? [item.brand] : (item.extensions || []),
          description: item.description || "",
          media: (
            (item.images && Array.isArray(item.images) && item.images.length > 0)
              ? [
                  { type: "image", link: item.thumbnail },
                  ...item.images
                    .filter((img: any) => img && img !== item.thumbnail)
                    .map((img: any) => ({ type: "image", link: typeof img === 'string' ? img : img.link || img.url || img }))
                ]
              : [{ type: "image", link: item.thumbnail }]
          ),
          sizes: (item.variants || item.sizes) ?
            Object.fromEntries(
              (item.variants || item.sizes || []).map((v: any, i: number) => [
                v.title || v.size || `Option ${i+1}`,
                {
                  link: v.link || v.url || "",
                  product_id: v.product_id || v.id || `${item.product_id || item.id}_${i}`,
                  serpapi_link: v.serpapi_link || "",
                  selected: !!v.selected
                }
              ])
            ) : {},
          highlights: item.highlights || [],
          features: item.features || [],
          link: item.link || "",
          store: item.source || item.store || "",
          shipping: item.shipping || "",
          snippet: item.snippet || "",
          reviews_link: item.reviews_link || "",
        }));
      const found = products.find((p: any) => p.product_id === productId);
      if (!found) {
        return new Response(JSON.stringify({ error: "Product not found" }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify(found), { status: 200, headers: corsHeaders });
    }
    // JWT validation
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("[productSearch] Missing authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized: Missing authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Optionally, decode and validate JWT here (for advanced security)
    const parsedQuery: QueryIntent = await req.json();
    const { keywords, filters = {} } = parsedQuery;

    // Build SerpAPI query
    const serpapiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpapiKey) throw new Error("Missing SerpAPI key");

    let q = keywords;
    // Append all filter values to the query string
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        q += ` ${value}`;
      } else if (Array.isArray(value)) {
        q += ' ' + value.join(' ');
      }
    });

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", q);
    url.searchParams.set("api_key", serpapiKey);
    url.searchParams.set("gl", "us");
    url.searchParams.set("hl", "en");

    const serpRes = await fetch(url.toString());
    if (!serpRes.ok) {
      const errText = await serpRes.text();
      console.error("[productSearch] SerpAPI error:", errText);
      // Log error for financial tracking
      return new Response(JSON.stringify({ error: "SerpAPI error", details: errText }), {
        status: 502,
        headers: corsHeaders
      });
    }
    const serpData = await serpRes.json();
    // Log API usage if available
    if (serpData.search_information) {
      console.log(`[${new Date().toISOString()}] SerpAPI usage:`, JSON.stringify(serpData.search_information));
    }
    const results = serpData.shopping_results || [];
    // Normalize to full Product[]
    let products = results
      .filter((item: any) => item.extracted_price && item.thumbnail)
      .map((item: any, idx: number) => ({
        product_id:
          item.product_id ||
          item.id ||
          `${item.title?.replace(/[^a-zA-Z0-9]/g, "_") || "untitled"}_${item.extracted_price || ""}_${idx}`,
        title: item.title || "Untitled Product",
        prices: [item.extracted_price ? `$${item.extracted_price}` : "N/A"],
        conditions: item.conditions || [],
        typical_prices: {
          low: item.extracted_price ? `$${item.extracted_price}` : "N/A",
          high: item.extracted_price ? `$${item.extracted_price}` : "N/A",
          shown_price: item.extracted_price ? `$${item.extracted_price}` : "N/A"
        },
        reviews: item.reviews || 0,
        rating: item.rating || 0,
        extensions: item.brand ? [item.brand] : (item.extensions || []),
        description: item.description || "",
        media: (
          (item.images && Array.isArray(item.images) && item.images.length > 0)
            ? [
                { type: "image", link: item.thumbnail },
                ...item.images
                  .filter((img: any) => img && img !== item.thumbnail)
                  .map((img: any) => ({ type: "image", link: typeof img === 'string' ? img : img.link || img.url || img }))
              ]
            : [{ type: "image", link: item.thumbnail }]
        ),
        sizes: (item.variants || item.sizes) ?
          Object.fromEntries(
            (item.variants || item.sizes || []).map((v: any, i: number) => [
              v.title || v.size || `Option ${i+1}`,
              {
                link: v.link || v.url || "",
                product_id: v.product_id || v.id || `${item.product_id || item.id}_${i}`,
                serpapi_link: v.serpapi_link || "",
                selected: !!v.selected
              }
            ])
          ) : {},
        highlights: item.highlights || [],
        features: item.features || [],
        link: item.link || "",
        store: item.source || item.store || "",
        shipping: item.shipping || "",
        snippet: item.snippet || "",
        reviews_link: item.reviews_link || "",
      }));
    // Helper for exact word match
    const wordMatch = (text: string, word: string) =>
      new RegExp(`\\b${word}\\b`, 'i').test(text);

    // Stricter, field-aware post-filtering
    if (filters && Object.keys(filters).length > 0) {
      products = products.filter((p: any) => {
        // Price filter
        const priceMax = (filters as any).priceMax;
        if (priceMax !== undefined) {
          const price = parseFloat((p.typical_prices.shown_price || p.prices[0] || "0").replace(/[^\d.]/g, ""));
          if (isFinite(price) && price > priceMax) return false;
        }
        // Store filter
        const storeVal = (filters as any).store;
        if (storeVal) {
          const storeStr = String(storeVal).toLowerCase();
          const inStore = (p.store && p.store.toLowerCase().includes(storeStr));
          const inTitle = p.title.toLowerCase().includes(storeStr);
          const inDesc = p.description.toLowerCase().includes(storeStr);
          const inLink = p.link && p.link.toLowerCase().includes(storeStr);
          if (!(inStore || inTitle || inDesc || inLink)) return false;
        }
        // Features filter (fuzzy match)
        if ((filters as any).features) {
          const featuresVal = String((filters as any).features).toLowerCase();
          const inFeatures = p.features && p.features.some((f: any) => f.text && f.text.toLowerCase().includes(featuresVal));
          const inTitle = p.title.toLowerCase().includes(featuresVal);
          const inDesc = p.description.toLowerCase().includes(featuresVal);
          if (!(inFeatures || inTitle || inDesc)) return false;
        }
        // Shipping filter (fuzzy match)
        if ((filters as any).shipping) {
          const shippingVal = String((filters as any).shipping).toLowerCase();
          const inTitle = p.title.toLowerCase().includes(shippingVal);
          const inDesc = p.description.toLowerCase().includes(shippingVal);
          if (!(inTitle || inDesc)) return false;
        }
        // Review count filter (numeric)
        if ((filters as any).reviewCount) {
          const reviewCountVal = String((filters as any).reviewCount);
          const match = reviewCountVal.match(/([><=]*)(\d+)/);
          if (match) {
            const op = match[1] || '>=';
            const num = parseInt(match[2], 10);
            if (op === '>=' && p.reviews < num) return false;
            if (op === '>' && p.reviews <= num) return false;
            if (op === '<=' && p.reviews > num) return false;
            if (op === '<' && p.reviews >= num) return false;
            if (op === '=' && p.reviews !== num) return false;
          }
        }
        // Rating filter (numeric)
        if ((filters as any).rating) {
          const ratingVal = String((filters as any).rating);
          const match = ratingVal.match(/([><=]*)(\d+(?:\.\d+)?)/);
          if (match) {
            const op = match[1] || '>=';
            const num = parseFloat(match[2]);
            if (op === '>=' && p.rating < num) return false;
            if (op === '>' && p.rating <= num) return false;
            if (op === '<=' && p.rating > num) return false;
            if (op === '<' && p.rating >= num) return false;
            if (op === '=' && p.rating !== num) return false;
          }
        }
        // All other filters (brand, size, color, type, animal, etc.)
        return Object.entries(filters).every(([key, val]) => {
          if ([
            'priceMax', 'store', 'features', 'shipping', 'reviewCount', 'rating'
          ].includes(key)) return true; // already handled
          if (typeof val === 'string') {
            switch (key) {
              case 'brand':
                return p.extensions && p.extensions.some((b: string) => wordMatch(b, val));
              case 'size':
              case 'color':
              case 'type':
              case 'animal':
                return wordMatch(p.title, val) || wordMatch(p.description, val);
              default:
                return wordMatch(p.title, val) || wordMatch(p.description, val);
            }
          } else if (Array.isArray(val)) {
            return val.every(v =>
              wordMatch(p.title, String(v)) ||
              wordMatch(p.description, String(v))
            );
          }
          return true;
        });
      });
    }
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("Edge function error:", err && (err.stack || err.message || err));
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: corsHeaders });
  }
}); 