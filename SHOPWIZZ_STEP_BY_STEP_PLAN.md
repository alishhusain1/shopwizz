# ShopWizz.ai Step-by-Step Implementation Plan (Ultra-Detailed)

## Context
- **Current codebase:** Uses Supabase Edge Functions for all backend logic (chat, product search, summaries), with legacy SerpAPI and affiliate tagging logic.
- **PRD V3:** Requires OpenAI-only product search, no affiliate tagging, direct product links, and strict image rendering as `<img>`. All backend logic remains in Supabase Edge Functions, but their implementation is updated to fit these requirements.
- **Goal:** Refactor and extend the codebase to fully comply with PRD V3, maximize security, and deliver a robust MVP.

---

## 1. Remove Affiliate Tagging Logic
- [ ] **Backend:**
  - [ ] Identify all references to affiliate tagging in Supabase Edge Functions (e.g., `affiliate_tags` table, link rewriting, `addAffiliate` helpers).
  - [ ] Remove affiliate tag injection from all product link generation.
  - [ ] Remove any affiliate-related environment variables.
  - [ ] Delete or refactor any code that logs or tracks affiliate clicks.
  - [ ] Remove affiliate-related admin actions and logs.
- [ ] **Frontend:**
  - [ ] Remove affiliate disclosure banners and UI elements.
  - [ ] Remove any logic that rewrites or appends affiliate tags to links.
  - [ ] Update tests to remove affiliate-related assertions.

## 2. Update Supabase Edge Functions for Product Search, Chat, and Summaries
- [ ] **General:**
  - [ ] Audit all Edge Functions for legacy SerpAPI, scraping, or affiliate logic.
  - [ ] Document all endpoints, expected inputs, and outputs.
- [ ] **Product Search Function:**
  - [ ] Remove all SerpAPI and scraping logic.
  - [ ] Implement OpenAI Web Search tool call:
    - [ ] Construct prompt for GPT-4 to extract product search intent and filters.
    - [ ] Call OpenAI API with user query and parse response.
    - [ ] Map OpenAI response to `ProductItem` structure:
      ```ts
      type ProductItem = {
        title: string,
        imageUrl: string | null,
        link: string, // direct product URL
        price: string | null,
        rating: string | null,
        reviewCount: string | null,
        whyBlurb: string // ≤ 120 chars
      }
      ```
    - [ ] Deduplicate products by domain + slug.
    - [ ] Fallback to Unsplash/local placeholder if `imageUrl` is null.
    - [ ] Add robust error handling and logging (no PII).
    - [ ] Add Deno KV caching for duplicate queries (TTL 15 min).
    - [ ] Validate all inputs and outputs (type checks, required fields).
    - [ ] Write unit tests for all logic branches.
- [ ] **Chat Function:**
  - [ ] Ensure chat intent extraction uses only OpenAI (no external HTTP except ElevenLabs for voice).
  - [ ] Support both text and image input (with size validation).
  - [ ] Return both structured JSON intent and human-friendly reply.
  - [ ] Add error handling for missing/invalid input, missing API keys, etc.
  - [ ] Add Deno KV caching for repeated queries if appropriate.
  - [ ] Write unit tests for all input types and error cases.
- [ ] **Product Summary Function:**
  - [ ] Refactor to use OpenAI function-calling for summary, analysis, and features.
  - [ ] Add caching for product summaries (TTL 24h).
  - [ ] Validate all inputs (product object shape).
  - [ ] Write unit tests for summary extraction and error handling.
- [ ] **Voice I/O (if enabled):**
  - [ ] Integrate ElevenLabs STT/TTS via Edge Functions.
  - [ ] Add timeout logic to abort if STT/TTS > 1s.
  - [ ] Write tests for voice input/output and error cases.
- [ ] **Security:**
  - [ ] Enforce JWT validation for all mutating requests.
  - [ ] Restrict CORS headers to only required origins.
  - [ ] Never log or expose secrets or PII.
  - [ ] Implement rate limiting (50 req/min/IP) in all Edge Functions.
  - [ ] Apply Row-Level Security (RLS) on all Supabase tables.
  - [ ] Ensure CSP, X-Frame-Options, X-Content-Type-Options, and CSRF protections are in place.
  - [ ] Document all security measures in code comments and docs.

## 3. Update Frontend Product Display
- [ ] **Product Grid:**
  - [ ] Refactor product card to use `<img src={product.imageUrl} alt={product.title} />`.
  - [ ] Add `onError` handler to fallback to Unsplash/local placeholder if image fails to load.
  - [ ] Clamp title to 2 lines, whyBlurb to 120 chars.
  - [ ] Display price, rating, reviewCount, and whyBlurb as per PRD.
  - [ ] Ensure Buy button opens direct product link in new tab (no affiliate tag).
  - [ ] Add ARIA labels and keyboard navigation for all interactive elements.
  - [ ] Add skeleton loaders for grid during loading states.
- [ ] **Filters & State:**
  - [ ] Refactor filter UI to match PRD (collapsible rail, top drawer on mobile).
  - [ ] Ensure all filter state is persisted (localStorage for anonymous, Supabase for signed-in).
  - [ ] Add tests for filter persistence and UI.
- [ ] **Accessibility:**
  - [ ] Ensure all images have alt text.
  - [ ] Ensure all interactive elements are keyboard-navigable.
  - [ ] Test with screen readers and fix any issues.
- [ ] **Testing:**
  - [ ] Write/expand Jest and Playwright tests for all product grid and filter flows.
  - [ ] Add tests for error states (missing image, broken link, etc.).

## 4. Security & Compliance
- [ ] **Backend:**
  - [ ] Enforce JWT validation for all mutating requests in Edge Functions.
  - [ ] Store all secrets in environment variables (never log or expose).
  - [ ] Implement rate limiting (50 req/min/IP) in all Edge Functions.
  - [ ] Apply RLS on all Supabase tables.
  - [ ] Set CSP, X-Frame-Options, X-Content-Type-Options, and CSRF protections.
  - [ ] Never log PII; use hashed identifiers if needed.
  - [ ] Document all security measures in code and docs.
- [ ] **Frontend:**
  - [ ] Never expose service role keys or OpenAI/ElevenLabs keys in client code.
  - [ ] Validate all user input before sending to backend.
  - [ ] Handle all API errors gracefully and never leak sensitive info to users.
  - [ ] Add tests for all security-related flows.

## 5. Performance & Caching
- [ ] **Backend:**
  - [ ] Implement Deno KV caching for duplicate queries (TTL 15 min) in product search Edge Function.
  - [ ] Implement caching for product summaries (TTL 24h).
  - [ ] Log cache hits/misses for monitoring.
- [ ] **Frontend:**
  - [ ] Prefetch next product batch in background as user scrolls (IntersectionObserver).
  - [ ] Use skeleton loaders for product grid during network delays.
  - [ ] Monitor JS bundle size (≤ 250kB gzip) and Lighthouse score (≥ 90).
  - [ ] Add tests for cache and prefetch logic.

## 6. Voice I/O (Optional, if enabled)
- [ ] **Backend:**
  - [ ] Integrate ElevenLabs STT for voice input and TTS for output via Edge Functions.
  - [ ] Add timeout logic to abort if STT/TTS > 1s.
  - [ ] Write tests for voice input/output and error cases.
- [ ] **Frontend:**
  - [ ] Add mic button and voice playback toggle to chat UI.
  - [ ] Add UI feedback for voice input/output (loading, errors).
  - [ ] Add tests for all voice flows.

## 7. Admin Panel (MVP Scope)
- [ ] **Backend:**
  - [ ] Implement `/admin` route, role-gated (admin/super_admin).
  - [ ] Provide read-only access to users, queries, product_clicks.
  - [ ] Log all admin actions (CRUD, impersonation, etc.).
  - [ ] Add KPI widgets (DAU, CTR, response time).
  - [ ] Add tests for all admin endpoints and actions.
- [ ] **Frontend:**
  - [ ] Build admin dashboard UI with widgets and tables.
  - [ ] Add role-based access control to admin routes.
  - [ ] Add tests for all admin UI flows.

## 8. Testing & QA
- [ ] **Unit Tests:**
  - [ ] Write/expand Jest unit tests for all backend and frontend modules.
- [ ] **Integration Tests:**
  - [ ] Write/expand Playwright e2e tests for all user flows (search, filters, chat, admin, voice).
- [ ] **Accessibility Tests:**
  - [ ] Test all pages/components with screen readers and keyboard navigation.
- [ ] **Performance Tests:**
  - [ ] Test FCP, TTI, and grid render time on Moto G4/4G.
- [ ] **Security Tests:**
  - [ ] Test rate limiting, JWT validation, and RLS enforcement.
- [ ] **Manual QA:**
  - [ ] Run through all MVP flows and edge cases.
  - [ ] Log and fix all bugs before launch.

## 9. Documentation & Launch Readiness
- [ ] **Docs:**
  - [ ] Update README and developer docs to reflect new flows and requirements.
  - [ ] Document all API endpoints, expected inputs/outputs, and security measures.
  - [ ] Ensure all environment variables are documented and up to date.
- [ ] **Launch Checklist:**
  - [ ] Prepare for security and performance sign-off before production.
  - [ ] Ensure all tests pass (100% e2e, unit, accessibility, security).
  - [ ] Review PRD V3 and confirm all requirements are met.
  - [ ] Final code review and approval.

---

## Notes
- All backend logic (chat, product search, summaries) is implemented in Supabase Edge Functions and updated to fit PRD V3.
- Prioritize security and compliance at every step.
- Reference PRD V3 for all feature and UX requirements.
- Use only OpenAI and ElevenLabs for external calls.
- All product links must be direct; all images must be rendered as `<img>`.

---

**This plan should be reviewed and updated as development progresses.** 