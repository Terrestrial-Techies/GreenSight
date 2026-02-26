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

const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = getModel();
    if (!model) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server" });
    }

    // Fetch parks from database
    const { data: parks, error } = await supabase
      .from("parks")
      .select("*");

    if (error) {
      console.warn("Chatbot parks context unavailable:", error.message);
    }

    // Create context for Gemini
    const parkContext = (parks || [])
      .slice(0, 50)
      .map((p) => {
        const name = p.name || p.park_name || "Unnamed Park";
        const description = p.description || p.summary || p.details || "No description available";
        return `Park: ${name} - ${description}`;
      })
      .join("\n");

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
      return res.status(429).json({
        error: "Gemini quota exceeded. Please enable billing or switch to another API key/project.",
      });
    }
    if (status === 401 || status === 403) {
      return res.status(status).json({
        error: "Gemini API key is invalid or unauthorized for this project.",
      });
    }
    res.status(500).json({ error: err?.message || "Gemini chatbot failed" });
  }
};

module.exports = { chatWithGemini };
