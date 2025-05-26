# API Structure Rules

## 1. API Endpoint Usage
- **Chat UI:** Use `https://<project-ref>.functions.supabase.co/openai-chat-user` for all general chat requests.
- **Product Summaries:** Use `https://<project-ref>.functions.supabase.co/openai-chat` (or your caching-enabled function) for product summary/analysis requests.

## 2. Authentication
- All API requests must include a valid Supabase JWT in the `Authorization` header.
  - Use the user's access token if authenticated.
  - Fallback to the anon key if not authenticated.
- Never expose service role keys or OpenAI API keys to the client.

## 3. Input Validation
- Validate all inputs before sending to the API.
  - For chat: Ensure `messages` is an array of `{ role: 'user' | 'assistant', content: string }`.
  - For product summaries: Ensure required product identifiers (e.g., `product_asin`) are present.

## 4. Error Handling
- Always check the response status.
  - If the response is not OK, throw or handle an error with a user-friendly message.
- Never leak sensitive error details to the client.

## 5. Caching
- Do not cache user-specific chat responses.
- Cache only non-user-specific data (e.g., product summaries) on the server/database.

## 6. Security
- Never send sensitive keys or tokens in the request body or expose them in client code.
- Restrict CORS as much as possible for your Edge Functions.

## 7. Modularity
- Keep API call logic in a single, well-documented module (e.g., `lib/api.ts`).
- Update all imports and usages if the API structure changes.

## 8. Documentation
- Document all API endpoints, expected inputs, and outputs in a central place (e.g., this file or code comments).
- Update documentation with every structural change.

---

### Example Reference
```ts
// lib/api.ts
export async function callChatGPT(messages: ChatMessage[], options: Record<string, any> = {}) {
  // ...auth logic...
  const res = await fetch('https://<project-ref>.functions.supabase.co/openai-chat-user', { ... });
  // ...error handling...
}
```

---

**Summary:**
Always use the correct, dedicated endpoint for each feature, authenticate securely, validate inputs, handle errors gracefully, and document changes. Never expose secrets, and keep all API logic modular and up to date. 