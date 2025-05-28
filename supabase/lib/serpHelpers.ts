const serpapiKey = Deno.env.get("SERPAPI_KEY");
if (!serpapiKey) throw new Error("Missing SerpAPI key");

const KV = await Deno.openKv();

export async function lookupSizeToken(size: string): Promise<string | undefined> {
  const cacheKey = ["sizeToken", size.toLowerCase()];
  const cached = await KV.get<string>(cacheKey);
  if (cached.value) return cached.value;

  // Probe SerpAPI for size token (simulate, as SerpAPI docs are not public for this)
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", `size ${size}`);
  url.searchParams.set("api_key", serpapiKey);
  url.searchParams.set("gl", "us");
  url.searchParams.set("hl", "en");
  const res = await fetch(url.toString());
  if (!res.ok) return undefined;
  const data = await res.json();
  // Simulate extracting a token (in real use, parse from tbs param or result)
  const token = size.toLowerCase();
  await KV.set(cacheKey, token, { expireIn: 3600 }); // 1 hour TTL
  return token;
}

export function addAffiliate(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("amazon.")) {
      u.searchParams.set("tag", "YOUR_AFFILIATE_TAG");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
} 