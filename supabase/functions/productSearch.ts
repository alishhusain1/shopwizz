import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import type { ProductItem, QueryIntent } from "./chat/lib/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const parsedQuery: QueryIntent = await req.json();
    const { keywords, filters = {} } = parsedQuery;

    // Build SerpAPI query
    const serpapiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpapiKey) throw new Error("Missing SerpAPI key");

    let q = keywords;
    if (filters.color) q += ` ${filters.color}`;
    // Add more filter logic as needed

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", q);
    url.searchParams.set("api_key", serpapiKey);
    url.searchParams.set("gl", "us");
    url.searchParams.set("hl", "en");

    const serpRes = await fetch(url.toString());
    if (!serpRes.ok) {
      const errText = await serpRes.text();
      return new Response(JSON.stringify({ error: "SerpAPI error", details: errText }), {
        status: 502,
        headers: corsHeaders
      });
    }
    const serpData = await serpRes.json();
    const results = serpData.shopping_results || [];
    // Normalize to full Product[]
    const products = results
      .filter((item: any) => item.extracted_price && item.thumbnail)
      .map((item: any, idx: number) => ({
        product_id: item.product_id || item.id || `prod_${idx}`,
        title: item.title || "Untitled Product",
        prices: [item.extracted_price ? `$${item.extracted_price}` : "N/A"],
        conditions: [],
        typical_prices: {
          low: item.extracted_price ? `$${item.extracted_price}` : "N/A",
          high: item.extracted_price ? `$${item.extracted_price}` : "N/A",
          shown_price: item.extracted_price ? `$${item.extracted_price}` : "N/A"
        },
        reviews: item.reviews || 0,
        rating: item.rating || 0,
        extensions: item.brand ? [item.brand] : [],
        description: item.description || "",
        media: [{ type: "image", link: item.thumbnail }],
        sizes: {},
        highlights: item.highlights || [],
        features: [],
      }));
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("Edge function error:", err && (err.stack || err.message || err));
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: corsHeaders });
  }
}); 