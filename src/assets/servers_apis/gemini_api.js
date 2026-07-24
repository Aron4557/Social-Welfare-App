// Browser-safe helper. The Gemini secret remains in the root server.mjs process.
export async function sendToSofi(messages) {
  const response = await fetch("/api/sofi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "SOFI is unavailable");
  return payload.reply;
}
