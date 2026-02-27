const supabase = require("../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialization moved to inside the route to prevent missing key crash

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

    if (error) throw error;

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini chatbot failed" });
  }
};

module.exports = { chatWithGemini };