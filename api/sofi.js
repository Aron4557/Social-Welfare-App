import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are SOFI, a warm, gentle mental-health support companion.
You listen, validate feelings, and offer practical, grounded coping suggestions.
You are NOT a therapist and do not diagnose. If someone expresses intent to harm
themselves or others, or is in immediate danger, calmly urge them to contact local
emergency services or a crisis line right away.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));
    while (history.length && history[0].role !== "user") {
      history.shift();
    }

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.text);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error("SOFI/Gemini error:", error);
    res.status(500).json({ error: error.message || "SOFI is unavailable" });
  }
}