const openaiKey = Deno.env.get("OPENAI_API_KEY");
if (!openaiKey) throw new Error("Missing OpenAI API key");

export async function gpt4VisionTags(file: Uint8Array): Promise<string[]> {
  // This endpoint is illustrative; actual OpenAI Vision API may differ
  const res = await fetch("https://api.openai.com/v1/images/vision/tags", {
    method: "POST",
    headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/octet-stream" },
    body: file
  });
  if (!res.ok) throw new Error("Vision tags failed");
  const data = await res.json();
  return (data.tags || []).slice(0, 5);
}

export async function gpt4Parse(prompt: string): Promise<{ parsedQuery: any; spokenSummary: string; confidence: number }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a world-class shopping assistant. Parse the user's intent and return a JSON object with { parsedQuery, spokenSummary, confidence } using function-calling. If confidence < 0.95, set a clarifying question in spokenSummary." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "parse_query",
          description: "Parse the user's shopping query",
          parameters: {
            type: "object",
            properties: {
              parsedQuery: { type: "object" },
              spokenSummary: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["parsedQuery", "spokenSummary", "confidence"]
          }
        }
      ],
      function_call: { name: "parse_query" }
    })
  });
  if (!res.ok) throw new Error("GPT-4 parse failed");
  const data = await res.json();
  const fnCall = data.choices?.[0]?.message?.function_call;
  if (!fnCall || !fnCall.arguments) throw new Error("No function_call result");
  const args = JSON.parse(fnCall.arguments);
  return args;
} 