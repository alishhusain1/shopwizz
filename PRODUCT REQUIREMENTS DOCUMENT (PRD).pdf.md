# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name: ShopWizz.ai

**Version:** MVP v1.1 – Global Internet Search

--- 

## Overview 

**ShopWizz.ai** is a fully responsive web application (desktop, laptop, tablet, mobile) offering AI-powered personal shopping assistance across the entire internet. Users navigate to the site, upload images, enter text, or use voice prompts to describe desired products. Leveraging GPT-4 and ElevenLabs voice APIs, ShopWizz.ai queries Google Product results via SerpAPI, returning ranked product links from across the web with embedded affiliate tags, AI-generated star ratings, and concise “Why buy” summaries. Customers filter results by price, brand, quality,reviews, shipping time, and pickup availability. Revenue is earned via affiliate partnerships embedded in all returned URLs. 

## Target User 

* **Primary user:** Online shoppers on any device seeking personalized product discovery without switching between multiple retailer sites. 

* **Secondary users (future):** Merchants, Support Agents, Super Admins.

## Goal of MVP 

**Success Criteria:** 

1. Fully responsive web UI optimized for mobile, tablet, and desktop: chat widget and filters adapt to screen size. 

2. End-to-end conversational search (image/text/voice) → global product results → affiliate links.

3. Core filters functional and persisting per anonymous session (localStorage) and permanently for logged-in users (Supabase). 

4. Optional signup prompt to save search/check-out history via Supabase.

5. Affiliate tagging embedded in all returned URLs for revenue tracking.

**Out of Scope:**

* In-app cart assembly or direct payment handling.

* Mobile apps, merchant dashboards, advanced admin features.

* Social sharing or loyalty programs.

---

## CORE FUNCTIONAL REQUIREMENTS (DO NOT SKIP) 

### 1. Authentication & Session 

* **Anonymous Default:** Users immediately access chat via text, voice, or image without signing up. 

* **Optional Signup Prompt:** Under chat input: “Save your search history? \[Sign up]” triggers Supabase Auth modal. 

* Must include: email/password registration, email verification, forgot password. OAuth optional later. 

* **Guardrail:** Signup optional; core features never blocked.

### 2. Responsive UI / Main Interface 

* **Layout:** Single-page app built in Next.js with Tailwind CSS.

* **Chat Widget Placement:**

 * Desktop/tablet: fixed right-side panel (width: 400px).

 * Mobile: bottom sheet full-width.

* **Widget Elements:**

 * Text input “Ask anything.” 

 * Image upload button.

 * Voice record button (ElevenLabs STT).

 * Recommended prompts below input.

 * Filters toggle collapsible section (price, brand, quality, reviews, shipping, pickup).

 * Signup prompt link.

 * Voice Chat Toggle to open floating voice panel.

* **Adaptive Behavior:** 

 * Collapse filters by default on screens &lt;768px.

 * Ensure readable font sizes and tap targets ≥44px.

* **Load Data:** from localStorage for anonymous, Supabase for registered.

# ### 3. Feature Modules

#### 3.1 Chat & Input Module

* **Inputs:** textPrompt, voiceBlob, imageFile.

* **Validation:** ≥1 input; file &lt;10 MB; text ≤500 chars.

* **Output:** `searchQuery` object.

# #### 3.2 AI Processing Module

* Use OpenAI GPT-4 API to parse inputs into `parsedQuery` JSON.

* ElevenLabs STT for voice transcription and TTS for response audio.

# #### 3.3 Global Product Lookup Module

* Query Google Product Search via SerpAPI using `parsedQuery` + filters.

* **Input:** keywords, imageTags, voiceTranscript + filter parameters.

* **Output:** `productItems[]` with fields: `title`, `imageUrl`, `price`, `brand`, `reviewCount`,`avgRating`, `affiliateUrl`, `sourceDomain`. 

* **Validation:** exclude items missing price or image.

#### 3.4 Results Display Module

* Render vertical list or responsive grid of product cards:

 * Image (200×200), title (≤60 chars), AI star rating + “Why buy” (≤100 chars), price, full-width purple “Buy Now” button linking to `affiliateUrl`. 

* Pagination/infinite scroll: 10–20 items per load.

* Mobile: vertical scroll; no swipe gestures required.

# #### 3.5 Voice Chat Module 

* **Voice Input:** record via widget mic; send to ElevenLabs STT.

* **Voice Output:** render response audio via ElevenLabs TTS in floating panel.

* **UI Controls:** play/pause, mic mute, close panel.

* **Guardrail:** respect device mute settings.

#### 3.6 Revenue & Monetization Module

* **Affiliate Integration:**

 * Append relevant affiliate tag or referral parameter to each `affiliateUrl`.

 * Ensure compliance with each affiliate program’s TOS (link formatting, disclosures).

# ### 4. Settings / Configurations

* **Filters:** price range, brandList, minRating, minReviewCount, maxShippingDays,pickupAvailability. 

* **Voice Chat settings:** STT/TTS toggle, playback volume.

* **Save preferences:** anonymous → localStorage; registered → Supabase on Save.

* **Guardrail:** explicit Save click required.

### 5. Admin Panel (future stub)

* **Roles:** user, admin, super\_admin. 

* **Planned features:** user management, affiliateTag management, analytics dashboard.

---

## NON-FUNCTIONAL REQUIREMENTS

* **Security:** 

 * OWASP Top 10 compliance; HTTPS for all API calls.

 * Input sanitization to prevent XSS.

 * JWT via Supabase for registered users; localStorage for anonymous.

* **Performance:**

 * Widget and results load &lt;2 s on 4G.

 * Debounce API calls (500 ms).

* **Responsiveness:** 

 * Tailwind CSS breakpoints: mobile (&lt;640 px), tablet (641–1024 px), desktop (&gt;1025 px).

 * WCAG 2.1 AA contrast; 44px touch targets.

* **Data Storage:**

 * `localStorage` for anonymous filters and searchHistory.

 * Supabase PostgreSQL: `users` table (UUID PK, email, password\_hash, role, preferences JSON, searchHistory JSON, timestamps). 

---

# ## GUARDRAILS FOR AI/DEVS (STRICT) 

* Do not change variable/field names.

* Do not assume missing logic; clarify before coding.

* No placeholders unless marked. 

* Do not alter UI/UX flows without approval.

* Follow component naming and order exactly.

* Keep implementation modular and DRY.

---

# ## TOOLS & STACK 

* **Frontend:** Next.js (React) + Tailwind CSS

* **Backend:** Supabase (Auth, Postgres)

* **AI:** OpenAI GPT-4 API; ElevenLabs STT/TTS

* **Product Search API:** SerpAPI Google Product Search

* **Hosting:** Vercel for frontend; Supabase Functions for backend

---

*End of PRD*

