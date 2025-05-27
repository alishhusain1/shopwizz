import { supabase } from "./supabase";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function callChatGPT(messages: ChatMessage[], options: Record<string, any> = {}) {
  // Try to get the current session's access token
  let accessToken: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      accessToken = data.session.access_token;
    }
  } catch (e) {
    // fallback below
  }
  // Fallback to anon key if not authenticated
  if (!accessToken) {
    accessToken = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  }

  // Route to correct endpoint
  const endpoint = options.product_id
    ? 'https://aoiftyzquultpxzphdfp.functions.supabase.co/open-ai-product-sum'
    : 'https://aoiftyzquultpxzphdfp.functions.supabase.co/openai-chat-user';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...options,
      messages,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'OpenAI function error');
  }
  return res.json();
} 