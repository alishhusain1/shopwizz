const elevenKey = Deno.env.get("ELEVEN_KEY");
if (!elevenKey) throw new Error("Missing ElevenLabs API key");

export async function elevenLabsSTT(blob: Uint8Array): Promise<string> {
  const res = await fetch("https://api.elevenlabs.io/v1/stt", {
    method: "POST",
    headers: { "xi-api-key": elevenKey, "Content-Type": "audio/mpeg" },
    body: blob
  });
  if (!res.ok) throw new Error("STT failed");
  const data = await res.json();
  return data.text || data.transcript || "";
}

export async function elevenLabsTTS(text: string): Promise<string> {
  const res = await fetch("https://api.elevenlabs.io/v1/tts", {
    method: "POST",
    headers: { "xi-api-key": elevenKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice: "Rachel", model_id: "eleven_multilingual_v2", output_format: "mp3_44100_128" })
  });
  if (!res.ok) throw new Error("TTS failed");
  const data = await res.json();
  return data.audio_base64;
} 