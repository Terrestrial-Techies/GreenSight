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
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch parks from database for context
    const { data: parks, error } = await supabase
      .from("parks")
<<<<<<< ours
      .select("*");
=======
      .select("name, latitude, longitude, description, city");
>>>>>>> theirs

    if (error) {
      console.warn("Chatbot parks context unavailable:", error.message);
    }

<<<<<<< ours
    // Create context for Gemini
    const parkContext = (parks || [])
      .slice(0, 50)
      .map((p) => {
        const name = p.name || p.park_name || "Unnamed Park";
        const description = p.description || p.summary || p.details || "No description available";
        const location = p.location || p.address || "Lagos";
        const condition = p.condition || "Good";
        return `- ${name}: ${description} (Location: ${location}, Condition: ${condition})`;
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

    // Format history for Gemini SDK (user/model)
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const systemPromptMessage = `
You are "Greenie", the friendly and expert AI guide for GreenSight, an app dedicated to discovering and preserving urban green spaces in Lagos, Nigeria.

YOUR GOAL: Help users find, explore, and appreciate parks, gardens, and nature spots in Lagos.

CONTEXT OF AVAILABLE PARKS:
${parkContext}

GUIDELINES:
1. ALWAYS be friendly, helpful, and passionate about nature and Lagos.
2. If the user asks for a recommendation, use the context above to suggest specific parks.
3. If they ask about conditions or amenities, refer to the context. If data is missing, suggest they check the "View Details" section in the app or look for community reports.
4. Encourage sustainable practices and community reporting.
5. If asked something unrelated to green spaces or Lagos, gently guide them back to your specialty.
6. Keep responses concise but informative.

Current User Input: ${message}
`;

    const result = await chat.sendMessage(systemPromptMessage);
    const response = await result.response;
    const text = response.text();
=======
    // Check if Gemini API key exists
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
       // Fallback local search logic if Gemini is not configured
       const lowerMsg = message.toLowerCase();
       let foundParks = [];
       if (lowerMsg.includes('quiet') || lowerMsg.includes('relax')) {
           foundParks = parks.filter(p => p.description && p.description.toLowerCase().includes('quiet') || p.description?.toLowerCase().includes('peaceful'));
       } else if (lowerMsg.includes('lagos')) {
           foundParks = parks.filter(p => p.city && p.city.toLowerCase() === 'lagos');
       } else if (lowerMsg.includes('abuja')) {
           foundParks = parks.filter(p => p.city && p.city.toLowerCase() === 'abuja');
       } else if (lowerMsg.includes('kaduna')) {
           foundParks = parks.filter(p => p.city && p.city.toLowerCase() === 'kaduna');
       } else {
           foundParks = parks.slice(0, 3); // return some random parks on generic query
       }

       if (foundParks.length > 0) {
           const names = foundParks.slice(0, 3).map(p => p.name).join(', ');
           return res.json({ reply: `Based on your request, I recommend checking out these parks: ${names}. They are highly rated in our database!` });
       } else {
           return res.json({ reply: "I couldn't find a specific park matching that exact text, but we have tons of great green spaces! Try searching by a city name like Lagos or Kaduna." });
       }
    }

    // If Gemini API Key exists, use it
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const parkContext = parks
          .map(p => `Park: ${p.name} - City: ${p.city} - ${p.description || "No description available"}`)
          .join("\n");

        const prompt = `
    You are a helpful assistant for a park discovery app called GreenSight.

    Here are available parks in our database:
    ${parkContext}

    User question:
    ${message}

    Respond in a friendly, helpful way, using ONLY the parks provided in the context above.
    `;
>>>>>>> theirs

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.json({ reply: text });
    } catch (apiError) {
        console.error("Gemini API Error:", apiError);
        return res.json({ reply: "I'm having trouble connecting to my AI brain right now, but you can explore parks using the search bar or map!" });
    }

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
