const supabase = require("../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const resolveGeminiKey = () => {
  const raw = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const aiKeyIndex = trimmed.indexOf("AIza");
  return aiKeyIndex >= 0 ? trimmed.slice(aiKeyIndex) : trimmed;
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
    return "I can still help while AI is limited. Share your area in Lagos and I'll suggest the closest green spaces.";
  }
  if (topParks.length) {
    return `AI is temporarily limited, but you can start with: ${topParks.join(", ")}.`;
  }
  return "AI is temporarily limited, but I can still help. Ask for nearby parks or family-friendly options.";
};

const chatWithGemini = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Fetch parks for context
    const { data: parks, error: dbError } = await supabase.from("parks").select("*");
    if (dbError) console.warn("Parks context unavailable:", dbError.message);

    const model = getModel();
    
    // 2. Immediate Fallback if No API Key
    if (!model) {
      return res.json({
        reply: buildFallbackReply(message, parks || []),
        degraded: true,
        reason: "missing_gemini_key",
      });
    }

    // 3. Prepare Context String
    const parkContext = (parks || [])
      .slice(0, 30)
      .map((p) => {
        const name = p.name || p.park_name || "Unnamed Park";
        const desc = p.description || p.summary || "No description available";
        const loc = p.location || p.address || "Lagos";
        return `- ${name}: ${desc} (Location: ${loc})`;
      })
      .join("\n");

    // 4. Format History for Gemini SDK
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const systemPrompt = `
      You are "Greenie", the friendly expert guide for GreenSight in Lagos, Nigeria.
      CONTEXT OF AVAILABLE PARKS:
      ${parkContext}
      
      GUIDELINES:
      - Use the context to suggest specific parks.
      - If data is missing, suggest checking the "View Details" section.
      - Keep it concise and Lagos-focused.
    `;

    // 5. Execute AI Generation
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text });

  } catch (err) {
    console.error("Chat Error:", err);
    const status = err?.status || 500;

    // Specific Error Handling
    if (status === 429) {
      return res.json({
        reply: "My AI quota is full for the moment. Try again shortly!",
        degraded: true,
        reason: "quota_exceeded"
      });
    }

    return res.json({
      reply: "I'm having a bit of a glitch, but you can still browse the map!",
      degraded: true,
      reason: "internal_error"
    });
  }
};

module.exports = { chatWithGemini };