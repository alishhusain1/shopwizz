# ShopWizz.ai MVP v1.0

## Overview
ShopWizz.ai is an AI-powered shopping assistant that helps users discover, filter, and purchase products with a seamless, accessible, and modern interface. The MVP leverages OpenAI GPT-4 for query parsing, ElevenLabs for voice, and Amazon PA API for product data. It features a dark, responsive UI, chat-driven search, advanced filters, and user authentication via Supabase.

**Reference:** See `PRODUCT REQUIREMENTS DOCUMENT (PRD).pdf` for a detailed product spec and feature list.

---

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth & Postgres)
- **AI:** OpenAI GPT-4, ElevenLabs STT/TTS
- **Product Data:** Amazon Product Advertising API
- **Hosting:** Vercel, Supabase Edge Functions
- **Testing:** Jest, React Testing Library

---

## Folder Structure
```
├── app/                # Next.js app directory (pages, routes, main UI)
│   ├── __tests__/      # Page-level tests
│   └── ...
├── components/         # Reusable UI components
│   ├── __tests__/      # Component-level tests
│   └── ...
├── contexts/           # React context providers (e.g., Auth)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions, API clients
├── public/             # Static assets (images, icons)
├── styles/             # Tailwind and global CSS
├── types/              # TypeScript type definitions
├── jest.config.js      # Jest configuration
├── jest.setup.js       # Jest setup (mocks, env)
├── babel.config.js     # Babel config for Next.js/Jest
├── tailwind.config.ts  # Tailwind CSS config
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

---

## Key Features (from PRD)
- **Dark, accessible theme** with custom accent and typography
- **Responsive layout** for mobile, tablet, desktop
- **Landing page** with hero, search, and CTA
- **Chat/search interface** with AI-driven suggestions
- **Advanced filters** (price, rating, delivery, etc.)
- **Product results grid** with Amazon affiliate links
- **Voice chat widget** (STT/TTS)
- **User history & profile** (localStorage + Supabase)
- **Signup/login modal** with Supabase Auth
- **Security & accessibility**: WCAG AA, input sanitization, keyboard focus
- **Performance**: <2s load, 500ms debounce

---

## Getting Started
1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Set up environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your Supabase project)
   - Amazon PA API keys, OpenAI, and ElevenLabs keys as needed
3. **Run the dev server:**
   ```sh
   pnpm dev
   ```
4. **Run tests:**
   ```sh
   pnpm test
   ```

---

## Contributing
- Follow the 8px grid, color, and naming conventions from the PRD
- Write/expand tests in `__tests__` folders
- Keep code modular and DRY
- See the PRD for feature and UX requirements

---

## License
MIT (or as specified) 