import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { elevenLabsTTS } from "./lib/eleven.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

Deno.serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { rawInput } = await req.json();
    console.log("[chat] Incoming payload:", JSON.stringify(rawInput));
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
      const messages = [
        { role: "system", content: "You are a helpful AI shopping assistant." },
        { role: "user", content: rawInput.text }
      ];
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages,
          max_tokens: 512,
          temperature: 0.7
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[chat] OpenAI API error:", errText);
        return new Response(JSON.stringify({ ok: false, error: "OpenAI API error", details: errText }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await res.json();
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
        model: "gpt-4-vision-preview",
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