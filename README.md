# ShopWizz.ai

## Overview
ShopWizz.ai is an AI-powered shopping assistant web app that helps users discover, filter, and purchase products from across the internet. It features a conversational chat interface, advanced filters, product grid, voice and image search, and persistent user context. The app leverages OpenAI GPT-4 for intent extraction, ElevenLabs for voice, SerpAPI for product data, and Supabase for authentication and backend logic.

**Key Features:**
- Conversational AI chat for product search and discovery
- Advanced filters (price, brand, rating, shipping, etc.)
- Responsive product grid with affiliate links
- Voice and image search (STT/TTS, image upload)
- Persistent chat and product state (localStorage/Supabase)
- User authentication (optional, via Supabase)
- Product detail pages with AI-generated summaries and reviews
- Modern, accessible, mobile-first UI

---

## Tech Stack & Architecture
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Edge Functions, Auth, Postgres)
- **AI:** OpenAI GPT-4 (intent extraction, summaries), ElevenLabs (voice)
- **Product Data:** SerpAPI (Google Shopping)
- **Hosting:** Vercel (frontend), Supabase (backend)
- **Testing:** Jest, React Testing Library

### Key Integrations
- **OpenAI:** Parses user chat into structured product search intent (JSON)
- **SerpAPI:** Fetches real-time product data from Google Shopping
- **Supabase Edge Functions:** Secure backend logic for chat, product search, and product summaries
- **ElevenLabs:** Voice-to-text and text-to-speech for chat

---

## Folder Structure
```
├── app/                # Next.js app directory (routes, pages, main UI)
│   ├── page.tsx        # Landing page (animated, hero, CTA)
│   ├── shop/           # Main chat + product search experience
│   │   └── page.tsx    # Chat, product grid, persistent state
│   ├── product/        # Product detail route
│   │   └── [id]/       # Dynamic product detail pages
│   │       └── page.tsx
│   ├── __tests__/      # Page-level tests
│   └── ...
├── components/         # Reusable UI components
│   ├── Header.tsx      # Navigation bar (auth, branding)
│   ├── ChatInterface.tsx # Chat UI (bubbles, typewriter, voice, image)
│   ├── SearchResultsLayout.tsx # Orchestrates chat, filters, product grid
│   ├── ProductResults.tsx # Product grid and summary
│   ├── AuthModals.tsx  # Signup/login modals
│   ├── FilterSidebar.tsx # Advanced filters
│   ├── ui/             # UI primitives (buttons, cards, etc.)
│   └── ...
├── contexts/           # React context providers (e.g., Auth)
├── hooks/              # Custom React hooks
├── lib/                # API clients, utility functions
│   └── api.ts          # Calls to edge functions (chat, product search)
├── public/             # Static assets (images, icons)
├── styles/             # Tailwind and global CSS
├── supabase/           # Supabase Edge Functions (backend logic)
│   ├── functions/
│   │   ├── chat/       # Chat intent extraction (OpenAI)
│   │   ├── productSearch.ts # Product search (SerpAPI)
│   │   └── aiProductSummary.ts # Product summary (OpenAI)
│   └── ...
├── types/              # TypeScript type definitions
├── package.json        # Project dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS config
└── README.md           # This file
```

---

## Main User Flow
1. **Landing Page (`/`)**
   - Animated gradient background, hero text, "Start Shopping" CTA
   - Clicking CTA routes to `/shop`
2. **Shop Page (`/shop`)**
   - Chat interface (type, voice, or image)
   - AI parses input to JSON intent (keywords, filters)
   - Product search runs via Supabase Edge Function (SerpAPI)
   - Product grid displays results, with filters and AI summary
   - State (chat, products, filters) is persisted in localStorage (anonymous) or Supabase (logged-in)
3. **Product Detail (`/product/[id]`)**
   - Loads product by ID (from localStorage or backend)
   - Shows all images, reviews, options, and AI-generated summary/analysis
   - "Buy Now" links to affiliate URL
   - "Back to results" returns to `/shop` with state restored

---

## Supabase Edge Functions
- **chat/**: Parses user input (text, image, voice) into structured product search intent using OpenAI. Always returns a JSON object (keywords, filters, suggestions) and a human-friendly reply. Handles context and follow-up queries.
- **productSearch.ts**: Receives parsed intent, queries SerpAPI for Google Shopping results, applies filters, and returns normalized product data. Also supports fetching a single product by ID.
- **aiProductSummary.ts**: Given a product, calls OpenAI to generate a summary, analysis, and feature list for the product detail page.

---

## Persistent State & Auth
- **Anonymous users:** All chat, search, and filter state is saved in localStorage and restored on reload/navigation.
- **Registered users:** State is saved in Supabase (Postgres) and synced on login.
- **Auth:** Supabase Auth (email/password, email verification, forgot password). Signup is optional and never blocks core features.

---

## How to Run Locally
1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Set up environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your Supabase project)
   - `OPENAI_API_KEY` (for chat and summaries)
   - `SERPAPI_KEY` (for product search)
   - `ELEVENLABS_API_KEY` (for voice features, optional)
   - See `.env.example` if available
3. **Run the dev server:**
   ```sh
   pnpm dev
   ```
4. **Run tests:**
   ```sh
   pnpm test
   ```
5. **Deploy:**
   - Frontend: Vercel (recommended)
   - Backend: Supabase Edge Functions (see Supabase docs)

---

## Contributing
- Follow the 8px grid, color, and naming conventions from the PRD
- Write/expand tests in `__tests__` folders
- Keep code modular, DRY, and accessible (WCAG AA)
- Reference the [PRODUCT REQUIREMENTS DOCUMENT (PRD).pdf](./PRODUCT%20REQUIREMENTS%20DOCUMENT%20(PRD).pdf.md) for all feature/UX requirements
- Use clear commit messages and open PRs for review

---

## Tips & Gotchas for New Devs
- **State persistence:** All chat/product state is restored on navigation (see `usePersistentState` in `/shop`)
- **Edge function auth:** All API calls require the correct Authorization header (see `lib/api.ts`)
- **AI output:** Always expect JSON from the chat edge function, except for onboarding/summary mode
- **Filters:** Both backend and frontend apply filters; check both if results seem off
- **Testing:** Use Jest and React Testing Library for all new components/pages
- **Voice/image:** Voice and image search require valid API keys and may be disabled if not set
- **PRD is source of truth:** When in doubt, check the PRD for requirements and flows

---

## License
MIT (or as specified) 