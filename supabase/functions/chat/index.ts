import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

Deno.serve(async (req: any) => {
  // Logging incoming request
  console.log(`[${new Date().toISOString()}] Incoming /chat request`);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    // JWT validation
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("[chat] Missing authorization header");
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized: Missing authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Optionally, decode and validate JWT here (for advanced security)
    const { rawInput, messages } = await req.json();
    console.log("[chat] Incoming payload:", JSON.stringify(rawInput), JSON.stringify(messages));
    if (!rawInput || typeof rawInput !== "object" || !rawInput.kind) {
      console.error("[chat] Invalid input:", rawInput);
      return new Response(JSON.stringify({ ok: false, error: "Invalid input: must provide { kind, text }" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error("[chat] Missing OpenAI API key");
      return new Response(JSON.stringify({ ok: false, error: "Missing OpenAI API key" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (rawInput.kind === "text") {
      if (!rawInput.text) {
        console.error("[chat] Missing text for chat");
        return new Response(JSON.stringify({ ok: false, error: "Missing text for chat" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Always inject system prompt and developer instruction
      const systemPrompt = {
        role: "system",
        content: `You are ShopWizz.ai's elite AI shopping assistant. Your sole purpose is to parse any user query into precise, actionable product search intent across the entire internet and return it as a JSON object, followed by a short human-friendly reply.\n\n1. JSON Output (first line only)\nAlways output a single JSON object with these keys:\n- keywords (string): a concise search phrase capturing the user's intent.\n- filters (object, optional): map every relevant attribute you can infer, such as:\n  - category, type, sub-type\n  - brand, manufacturer\n  - color, pattern, style\n  - size, dimension, capacity\n  - material, features (waterproof, wireless, organic, etc.)\n  - priceRange (string, e.g. "<50", "50–100", ">200")\n  - rating (e.g. ">=4"), reviewCount\n  - shipping (e.g. "freeShipping", "express"), availability (inStock, preOrder)\n  - animal, ageGroup (e.g. "puppy", "adult")\n  - gender, usage (e.g. "gaming", "outdoor")\n- suggestions (array of strings, optional): if intent is broad or ambiguous, list 3–5 specific refinements the user could choose (styles, sub-categories, brands, etc.).\n\n2. Human-Friendly Reply (second line only)\nProvide a brief, natural-language sentence referencing the search (e.g., "Here are X for Y").\n\nGuardrails:\n- Do not output any keys beyond keywords, filters, and suggestions.\n- Do not include extraneous text or formatting (no markdown, no code fences).\n- The first line must be valid JSON. The second line must be a single, short, human-friendly sentence.\n- If the user refines a previous search (contextual query), merge new filters with existing ones.\n- If a required filter is missing, either infer it from context or ask a follow-up question in natural language after the JSON.\n- Always ensure keywords accurately reflect the core intent; do not hallucinate.\n- If user asks for "all available products," you may limit to top 20 results but still parse full intent.\n- Always use the full chat history to infer missing details or context.\n\nExamples:\nUser: "I need a waterproof hiking backpack under $150"\nAssistant:\n{ "keywords":"hiking backpack", "filters":{ "features":"waterproof", "priceRange":"<150", "type":"backpack", "usage":"hiking" } }\nHere are waterproof hiking backpacks under $150.\n\nUser: "Show me laptops"\nAssistant:\n{ "keywords":"laptops", "filters":{} , "suggestions":["gaming laptops","ultrabooks","2-in-1 laptops","budget laptops","MacBooks"] }\nWhich type of laptops are you interested in?\n\nUser: "Dark versions"\nAssistant:\n{ "keywords":"dark laptops","filters":{ "color":"dark","category":"laptops" } }\nHere are dark-colored laptops that fit your criteria!\n\nUser: "Shampoo under $30 at Sephora"\nAssistant:\n{ "keywords":"shampoo Sephora", "filters":{ "priceRange":"<30", "store":"Sephora", "category":"shampoo" } }\nHere are shampoos under $30 available at Sephora.\n\nUser: "Dog treats that are healthy and freshly baked"\nAssistant:\n{ "keywords":"healthy freshly baked dog treats", "filters":{ "animal":"dog", "features":"healthy, freshly baked", "type":"treats" } }\nHere are healthy, freshly baked dog treats.\n\nUser: "Wireless headphones with noise cancellation, 4+ stars, free shipping"\nAssistant:\n{ "keywords":"wireless headphones noise cancellation", "filters":{ "features":"wireless, noise cancellation", "rating":">=4", "shipping":"freeShipping", "type":"headphones" } }\nHere are wireless headphones with noise cancellation, rated 4 stars and up, with free shipping.\n\nUser: "Nike running shoes, size 10, under $100"\nAssistant:\n{ "keywords":"Nike running shoes", "filters":{ "brand":"Nike", "type":"running shoes", "size":"10", "priceRange":"<100" } }\nHere are Nike running shoes, size 10, under $100.\n\nUser: "Best baby strollers with at least 100 reviews"\nAssistant:\n{ "keywords":"baby strollers", "filters":{ "category":"strollers", "ageGroup":"baby", "reviewCount":">=100" } }\nHere are baby strollers with at least 100 reviews.\n\nUser: "Organic cat food"\nAssistant:\n{ "keywords":"organic cat food", "filters":{ "animal":"cat", "features":"organic", "type":"food" } }\nHere are organic cat food options.\n\nUser: "I want something for outdoor camping"\nAssistant:\n{ "keywords":"outdoor camping gear", "filters":{ "usage":"camping", "category":"outdoor gear" }, "suggestions":["tents","sleeping bags","camping stoves","lanterns","backpacks"] }\nWhat kind of outdoor camping gear are you looking for?\n\nUser: "Show me all available products"\nAssistant:\n{ "keywords":"all products", "filters":{}, "suggestions":["electronics","clothing","home goods","toys","beauty"] }\nHere are the top 20 available products across all categories.`
      };
      // Format chat history as alternating user/assistant roles
      let formattedHistory = [];
      if (Array.isArray(messages)) {
        for (const m of messages.slice(-9)) {
          if (m.role === "user" || m.role === "assistant") {
            formattedHistory.push({ role: m.role, content: m.content });
          }
        }
      }
      // Add the current user message
      formattedHistory.push({ role: "user", content: rawInput.text });
      // Prepend system prompt
      const chatMessages = [systemPrompt, ...formattedHistory];
      let openaiPayload: any = {
        model: "gpt-4o",
        messages: chatMessages,
        max_tokens: 512,
        temperature: 0.7
      };
      // Only set response_format for intent extraction, not for summarize mode
      if (!(rawInput.text && rawInput.text.trim().toLowerCase().startsWith('summarize this product search intent'))) {
        openaiPayload.response_format = { type: "json_object" };
      }
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(openaiPayload)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[chat] OpenAI API error:", errText);
        // Log error for financial tracking
        return new Response(JSON.stringify({ ok: false, error: "OpenAI API error", details: errText }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await res.json();
      // Log token usage if available
      if (data.usage) {
        console.log(`[${new Date().toISOString()}] OpenAI usage:`, JSON.stringify(data.usage));
      }
      const reply = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ ok: true, reply }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else if (rawInput.kind === "image") {
      if (!rawInput.image) {
        console.error("[chat] Missing image data");
        return new Response(JSON.stringify({ ok: false, error: "Missing image data" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Validate image size (base64 length * 3/4 = bytes)
      const imageSize = Math.floor((rawInput.image.length * 3) / 4);
      if (imageSize > MAX_IMAGE_SIZE) {
        console.error("[chat] Image too large:", imageSize, "bytes");
        return new Response(JSON.stringify({ ok: false, error: "Image too large (max 20MB)" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Compose vision API payload
      const contentArr = [];
      if (rawInput.text) {
        contentArr.push({ type: "text", text: rawInput.text });
      }
      contentArr.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${rawInput.image}` } });
      const visionPayload = {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: contentArr
          }
        ],
        max_tokens: 512
      };
      console.log("[chat] Vision API payload:", JSON.stringify(visionPayload));
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(visionPayload)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[chat] OpenAI Vision API error:", errText);
        return new Response(JSON.stringify({ ok: false, error: "OpenAI Vision API error", details: errText }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ ok: true, reply }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      console.error("[chat] Unsupported input kind:", rawInput.kind);
      return new Response(JSON.stringify({ ok: false, error: "Unsupported input kind" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err: any) {
    console.error("[chat] Exception:", err && (err.stack || err.message || err));
    return new Response(JSON.stringify({ ok: false, error: "Failed to handle input", details: err && (err.stack || err.message || err) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}); 