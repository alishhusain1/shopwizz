# PRODUCT REQUIREMENTS DOCUMENT (PRD) – ShopWizz.ai

Version: MVP v1.2 – Global Internet Search Last Updated: May 29, 2025 Source of Truth: This PRD plus the accompanying README.md. Any conflicts shall be resolved in favor of the README. 

1.​ OVERVIEW ShopWizz.ai is a fully‑responsive, AI‑powered shopping assistant that lets users discover, filter, and purchase products from across the internet through a conversational interface (text, voice, image). It combines GPT‑4 for intent extraction, ElevenLabs for speech, SerpAPI for real‑time product data, and Supabase for authentication, Edge Functions, and persistent storage. Revenue is earned exclusively through affiliate links embedded in every returned product. 

2.​ TARGET USERS • Primary: General online shoppers on mobile, tablet, or desktop – need fast, accurate product discovery without hopping between retailer sites. • Secondary (future): Merchants, support agents, and super‑admins – need self‑service dashboards, analytics, and user management (post‑MVP). 

3.​ GOALS & SUCCESS CRITERIA (MVP) • Responsive UI seamlessly adapts to mobile, tablet, and desktop. • End‑to‑end flow: text/voice/image → AI parsing → global product results → affiliate link out. • Filters persist per anonymous session (localStorage) and per registered user (Supabase). • Optional signup that never blocks core search capability. • 100 % affiliate tagging on all outbound product URLs for revenue tracking. 

KPIs – ≤ 2 s initial content load on 4 G. – ≥ 95 % successful AI → product‑result conversions. – &lt; 0.5 % API error rate in Edge Functions. 

4.​ OUT OF SCOPE (MVP) • Shopping cart, checkout, or payment processing. • Native mobile apps, merchant portals, loyalty programs, or social sharing. 

5.​ KEY FEATURES 

6.​ Conversational Chat – Multimodal input (text ≤ 500 chars, voice ≤ 30 s, image ≤ 10 MB).GPT‑4 returns structured JSON intent. 

7.​ Advanced Filters – Price, brand, rating, review count, shipping speed, pickup availability;collapsible on &lt; 768 px screens. 

8.​ Responsive Product Grid – Cards show image, price, brand, AI star rating, 100‑char “Why buy” blurb, and full‑width purple “Buy Now” button. 

9.​ Voice & Image Search – ElevenLabs STT/TTS; image tags extracted by GPT‑4 before SerpAPI call. 

10.​Persistent State – Anonymous state in localStorage; registered state synced to Supabase (preferences, searchHistory). 

11.​Affiliate Revenue – All product links include program‑specific tags; disclosure banner in footer. 

12.​Edge Functions – chat/, productSearch.ts, aiProductSummary.ts – secured by JWT,rate‑limited, and OWASP‑compliant. 

13.​PRIMARY USER FLOW Landing Page → Shop → AI parses intent → Edge Function productSearch → Product Grid + Filters → Product Detail → Buy Now (affiliate site). State automatically restores when users navigate back to /shop. 

14.​TECH STACK & ARCHITECTURE • Frontend: Next.js (App Router), React, TypeScript,Tailwind CSS – Responsive SPA & UI styling. • Backend: Supabase (Auth, Postgres, Edge Functions) – Auth, persistence, secure serverless logic. • AI Services: OpenAI GPT‑4; ElevenLabs STT/TTS – Intent parsing, summaries; speech in/out. • Product Data: SerpAPI (Google Shopping) – Real‑time, normalized product catalog. • Testing: Jest, React Testing Library – Unit & integration tests with ≥ 80 % coverage. • Hosting: Vercel (frontend); Supabase (backend) – CI/CD, edge deployment. 

15.​CORE FUNCTIONAL REQUIREMENTS 8.1 Authentication & Session – Anonymous by default; optional email/password signup (Supabase). – Verification email and forgot‑password flows. – JWT stored in localStorage; renew ≤ 60 min. – Signup banner: “Save your searches? [Sign up]”. 

8.2 Chat & Input Module – Accepts textPrompt, voiceBlob, or imageFile. – Validates non‑empty input; file ≤ 10 MB. – Emits searchQuery (unparsed). 

8.3 AI Processing Module – GPT‑4 converts searchQuery into parsedQuery JSON. – ElevenLabs transcribes voice and returns TTS audio of chatbot reply. – Fallback: show text if audio fails. 

8.4 Global Product Lookup Module – SerpAPI called with keywords, image tags, and filters. – Returns productItems[] (title, imageUrl, price, brand, reviewCount, avgRating, affiliateUrl, sourceDomain). – Filters out items with missing price or image. 

8.5 Results Display Module – Grid (desktop/tablet) or vertical list (mobile). – Infinite scroll loading 10–20 items per batch. – “Buy Now” opens affiliateUrl in new tab. 

8.6 Voice Chat Module – Floating panel with play/pause, mute, close. – Respects OS mute switch; autoplay disabled unless user gesture present. 

8.7 Persistent State – usePersistentState React hook hydrates from localStorage or Supabase on page load. – Sync debounce = 500 ms to limit writes. 

8.8 Revenue & Monetization – Affiliate tag appended server‑side in productSearch.ts. – Footer disclosure: “As an Amazon/affiliate partner, we earn from qualifying purchases.” – Click‑throughs tracked via Supabase linkClicks table. 

9.​ NON‑FUNCTIONAL REQUIREMENTS Security – OWASP Top‑10 compliance; HTTPS everywhere; input sanitized on server and client; Supabase RLS for multitenancy. 

Performance – TTI ≤ 2 s on 4 G; Edge Functions cold‑start ≤ 400 ms; API debounced 500 ms.

Accessibility – WCAG 2.1 AA; 44‑px touch targets; aria‑labels for all interactive elements.

Scalability – Horizontal scaling via Vercel edge; Postgres indexes on users.id,searchHistory→keywords. 

Testing – ≥ 80 % unit/integration coverage; CI gates on Jest & RTL. 

Logging – Structured JSON logs (Edge Functions); client errors piped to Sentry.

10.​GUARDRAILS FOR AI & DEVELOPERS • Do NOT change any variable or schema names without approval. • Clarify ambiguous requirements before coding. • No placeholder logic unless explicitly marked // TODO. • Preserve component order and naming from folder structure. • Enforce DRY principles; isolate side‑effects in hooks / Edge Functions. 

11.​FUTURE ROADMAP (POST‑MVP)

12.​Admin Panel with role‑based access, affiliate tag management, and analytics.

13.​OAuth (Google, Apple) signup.

14.​Personalization: fine‑tuned GPT profile per user.

15.​Native Mobile Apps using Expo + React Native.

END OF DOCUMENT 

