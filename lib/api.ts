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

  const res = await fetch('https://aoiftyzquultpxzphdfp.functions.supabase.co/openai-chat-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages,
      ...options,
    }),
  });
  if (!res.ok) throw new Error('OpenAI chat function error');
  return res.json();
} 