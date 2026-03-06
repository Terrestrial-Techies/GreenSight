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

    // Fetch parks from database
    const { data: parks, error } = await supabase
      .from("parks")
      .select("name, lat, lon, description, city");

    if (error) {
      console.warn("Chatbot parks context unavailable:", error.message);
    }

    // If Gemini API Key exists, use it
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash"
        });

        const parkContext = parks
          .map(p => `Park: ${p.name} - City: ${p.city} - ${p.description || "No description available"}`)
          .join("\n");

        const prompt = `
    You are a helpful and concise assistant for a park discovery app called GreenSight.

    Here are available parks in our database:
    ${parkContext}

    User question:
    ${message}

    Respond in a friendly, helpful way, using ONLY the parks provided in the context above. KEEP YOUR RESPONSE SHORT, CONCISE, AND STRAIGHT TO THE POINT (2-3 short sentences MAX). Do NOT list all parks.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.json({ reply: text });
    } catch (apiError) {
        console.error("Gemini API Error:", apiError);
        return res.json({ reply: "I'm having trouble connecting to my AI brain right now, but you can explore parks using the search bar or map!" });
    }

    const prompt = `
You are a helpful assistant for a park discovery app called GreenSight.

Here are available parks:
${parkContext}

User question:
${message}

Respond in a friendly, helpful way.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error(err);
    const status = err?.status || err?.statusCode || 500;
    if (status === 429) {
      return res.json({
        reply: "Gemini quota is currently exceeded. I can still help with basic park suggestions if you tell me your area.",
        degraded: true,
        reason: "quota_exceeded",
      });
    }
    if (status === 401 || status === 403) {
      return res.json({
        reply: "AI provider authorization is currently unavailable. I can still suggest parks based on available listings.",
        degraded: true,
        reason: "auth_error",
      });
    }
    return res.json({
      reply: "AI is temporarily unavailable, but I can still help with basic park guidance. Ask for nearby or quieter spots.",
      degraded: true,
      reason: "unknown_error",
    });
  }
};

module.exports = { chatWithGemini };
