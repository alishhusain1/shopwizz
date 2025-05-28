import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { product } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_KEY");
    if (!openaiKey) throw new Error("Missing OpenAI key");

    // Call OpenAI with function-calling for summary, analysis, and features
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4-1106-preview",
        messages: [
          { role: "system", content: "You are a world-class product analyst. Given the following product details, return a JSON object with { summary, analysis, features } using function-calling. Features should be an array of { name, text }." },
          { role: "user", content: JSON.stringify(product) }
        ],
        functions: [
          {
            name: "summarize_product",
            description: "Summarize and analyze a product, extract features.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                analysis: { type: "string" },
                features: {
                  type: "array",
                  items: { type: "object", properties: { name: { type: "string" }, text: { type: "string" } } }
                }
              },
              required: ["summary", "analysis", "features"]
            }
          }
        ],
        function_call: { name: "summarize_product" }
      })
    });
    if (!response.ok) throw new Error("OpenAI call failed");
    const data = await response.json();
    const fnCall = data.choices?.[0]?.message?.function_call;
    if (!fnCall || !fnCall.arguments) throw new Error("No function_call result");
    const { summary, analysis, features } = JSON.parse(fnCall.arguments);

    // Optionally: cache in Supabase here

    return new Response(JSON.stringify({ summary, analysis, features }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: corsHeaders });
  }
}); 