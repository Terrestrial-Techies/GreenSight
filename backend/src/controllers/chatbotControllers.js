const supabase = require("../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch parks from database
    const { data: parks, error } = await supabase
      .from("parks")
      .select("name, latitude, longitude, description");

    if (error) throw error;

    // Create context for Gemini
    const parkContext = parks
      .map(p => `Park: ${p.name} - ${p.description || "No description available"}`)
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
    res.status(500).json({ error: "Gemini chatbot failed" });
  }
};

module.exports = { chatWithGemini };