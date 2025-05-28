# Cursor Rule: Edge Function Caching

**Rule:**  
All Supabase Edge Functions that call external APIs (e.g., OpenAI, SerpAPI, ElevenLabs) or perform expensive computations MUST implement Deno KV caching for their primary output, using a secure, collision-resistant cache key and a minimum TTL of 1 hour (unless otherwise justified).

**Rationale:**  
- Reduces server costs and latency.
- Prevents API rate limit issues.
- Ensures consistent, fast user experience.

**Implementation Pattern:**
- Use `Deno.openKv()` for caching.
- Use a hash of the input (e.g., product_id, query, or a hash of the request body) as the cache key.
- Check cache before making external API calls.
- Store results with a sensible TTL (default: 1 hour for search, 24 hours for product summaries).

**Example:**
```ts
const KV = await Deno.openKv();
const CACHE_TTL_SECONDS = 3600; // 1 hour

const cacheKey = ["functionName", hashInput(input)];
const cached = await KV.get(cacheKey);
if (cached.value) return new Response(JSON.stringify(cached.value), { status: 200 });

const result = await expensiveApiCall(input);
await KV.set(cacheKey, result, { expireIn: CACHE_TTL_SECONDS });
return new Response(JSON.stringify(result), { status: 200 });
``` 