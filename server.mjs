import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = join(root, "dist");

async function loadLocalEnvironment() {
  try {
    const envFile = await readFile(join(root, ".env"), "utf8");
    for (const rawLine of envFile.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[name]) process.env[name] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.warn("Could not read .env:", error.message);
  }
}

await loadLocalEnvironment();

const port = Number(process.env.PORT || 3000);
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function json(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 40000) throw new Error("Request too large");
  }
  return JSON.parse(raw || "{}");
}

async function handleSofi(request, response) {
  if (!process.env.GEMINI_API_KEY) {
    return json(response, 503, { error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const body = await readBody(request);
    const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const contents = history
      .filter((message) => ["user", "model"].includes(message.role) && typeof message.text === "string")
      .map((message) => ({
        role: message.role,
        parts: [{ text: message.text.slice(0, 3000) }],
      }));

    if (!contents.length) return json(response, 400, { error: "A message is required." });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are SOFI, a warm mental-health support assistant for people in Namibia. Focus on emotional wellbeing, reflective listening, grounding exercises, healthy coping strategies, and encouraging appropriate professional support. Be concise, gentle, culturally respectful, and ask at most one question at a time. Never diagnose, prescribe medication, claim to replace a clinician, or invent local services. If a user may be in immediate danger, may harm themselves or someone else, or describes abuse requiring urgent protection, encourage them to contact local emergency services and a trusted nearby person now. Do not provide graphic details. Clearly state that you are an AI when asked.",
              },
            ],
          },
          contents,
        }),
      },
    );

    const payload = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("Gemini API error", geminiResponse.status, payload?.error?.message);
      return json(response, 502, { error: "The support service could not respond." });
    }

    const reply = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) return json(response, 502, { error: "The support service returned an empty response." });
    return json(response, 200, { reply });
  } catch (error) {
    console.error("SOFI request failed", error.message);
    return json(response, 400, { error: "The request could not be processed." });
  }
}

async function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const safePath = normalize(requestPath).replace(/^([/\\])+/, "");
  let filePath = join(dist, safePath || "index.html");

  if (!filePath.startsWith(dist)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  try {
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, "index.html");
  } catch {
    filePath = join(dist, "index.html");
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/sofi") {
    return handleSofi(request, response);
  }
  if (request.method === "GET" || request.method === "HEAD") {
    return serveStatic(request, response);
  }
  response.writeHead(405);
  response.end("Method not allowed");
}).listen(port, "0.0.0.0", () => {
  console.log(`Social Welfare Namibia is running on http://0.0.0.0:${port}`);
});
