# Local Development Setup for ShopWizz.ai

This guide documents the steps taken to set up and run the ShopWizz.ai project locally on your machine.

---

## 1. Clone the Repository
Clone the ShopWizz.ai repository into your desired directory:
```sh
git clone https://github.com/alishhusain1/shopwizz .
```

## 2. Install Dependencies
Install the required dependencies using npm (since pnpm was not available):
```sh
npm install --legacy-peer-deps
```
*Note: The `--legacy-peer-deps` flag was used to resolve dependency conflicts between `date-fns` and `react-day-picker`.*

## 3. Set Up Environment Variables
Create a file named `.env.local` in the project root with the following content:
```
NEXT_PUBLIC_SUPABASE_URL=https://aoiftyzquultpxzphdfp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWZ0eXpxdXVsdHB4enBoZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzE5MTQsImV4cCI6MjA2MzgwNzkxNH0.3kURgC2P1YId5QBaYclTEtivG9PNmJpLRBSoJmbTHyo

# Add your API keys below to enable all features:
OPENAI_API_KEY=
SERPAPI_KEY=
ELEVENLABS_API_KEY=
```
- Fill in your API keys for OpenAI, SerpAPI, and ElevenLabs if you want to enable all features.

## 4. Start the Development Server
Run the following command to start the Next.js development server:
```sh
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

## 5. Troubleshooting
- If you encounter dependency errors, try deleting `node_modules` and `package-lock.json`, then reinstall with `npm install --legacy-peer-deps`.
- For missing features, ensure your API keys are set in `.env.local` and restart the server.

---

**You're now ready to develop and test ShopWizz.ai locally!** 