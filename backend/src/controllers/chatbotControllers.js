const supabase = require("../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const resolveGeminiKey = () => {
  const raw = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const aiKeyIndex = trimmed.indexOf("AIza");
  if (aiKeyIndex >= 0) {
    return trimmed.slice(aiKeyIndex);
  }

  return trimmed;
};

const getModel = () => {
  const key = resolveGeminiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return genAI.getGenerativeModel({ model: modelName });
};

const buildFallbackReply = (message, parks = []) => {
  const text = (message || "").toLowerCase();
  const topParks = parks
    .slice(0, 3)
    .map((p) => p.name || p.park_name)
    .filter(Boolean);

  if (text.includes("near") || text.includes("closest")) {
    return "I can still help while AI is limited. Share your area in Lagos and I will suggest the closest green spaces.";
  }
  if (text.includes("open") || text.includes("time") || text.includes("hours")) {
    return "I cannot verify live opening hours right now. Please check park details in-app and community updates before visiting.";
  }
  if (topParks.length) {
    return `AI is temporarily limited, but you can start with: ${topParks.join(", ")}. Ask for a specific area and I will narrow it down.`;
  }
  return "AI is temporarily limited, but I can still help. Ask for nearby parks, quieter spots, or family-friendly options.";
};

const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { data: parks, error } = await supabase.from("parks").select("*");

    if (error) {
      console.warn("Chatbot parks context unavailable:", error.message);
    }

    const parkContext = (parks || [])
      .slice(0, 50)
      .map((p) => {
        const name = p.name || p.park_name || "Unnamed Park";
        const city = p.city || p.location || "Unknown City";
        const description =
          p.description || p.summary || p.details || "No description available";
        return `Park: ${name} - City: ${city} - ${description}`;
      })
      .join("\n");

    const model = getModel();
    if (!model) {
      return res.json({
        reply: buildFallbackReply(message, parks || []),
        degraded: true,
        reason: "missing_gemini_key",
      });
    }

    const prompt = `
You are a helpful assistant for a park discovery app called GreenSight.

Here are available parks in our database:
${parkContext}

User question:
${message}

Respond in a friendly, helpful way, using ONLY the parks provided in the context above.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.json({ reply: text });
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      return res.json({
        reply:
          "I'm having trouble connecting to my AI brain right now, but you can explore parks using the search bar or map!",
      });
    }
  } catch (err) {
    console.error(err);
    const status = err?.status || err?.statusCode || 500;
    if (status === 429) {
      return res.json({
        reply:
          "Gemini quota is currently exceeded. I can still help with basic park suggestions if you tell me your area.",
        degraded: true,
        reason: "quota_exceeded",
      });
    }
    if (status === 401 || status === 403) {
      return res.json({
        reply:
          "AI provider authorization is currently unavailable. I can still suggest parks based on available listings.",
        degraded: true,
        reason: "auth_error",
      });
    }
    return res.json({
      reply:
        "AI is temporarily unavailable, but I can still help with basic park guidance. Ask for nearby or quieter spots.",
      degraded: true,
      reason: "unknown_error",
    });
  }
};

module.exports = { chatWithGemini };
