const supabase = require("../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Gemini AI helpers (same pattern as chatbotControllers) ---
const resolveGeminiKey = () => {
  const raw = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const aiKeyIndex = trimmed.indexOf("AIza");
  if (aiKeyIndex >= 0) return trimmed.slice(aiKeyIndex);
  return trimmed;
};

const getModel = () => {
  const key = resolveGeminiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return genAI.getGenerativeModel({ model: modelName });
};

// Simple in-memory cache to avoid redundant AI calls (TTL: 30 minutes)
const aiCache = new Map();
const AI_CACHE_TTL = 30 * 60 * 1000;

const generateParkInsights = async (park, reviews) => {
  const cacheKey = `park-${park.id}`;
  const cached = aiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < AI_CACHE_TTL) {
    return cached.data;
  }

  const model = getModel();
  if (!model) return null;

  const reviewTexts = (reviews || [])
    .slice(0, 10)
    .map((r) => r.review_text)
    .filter(Boolean)
    .join("\n- ");

  const prompt = `You are an expert assistant for GreenSight, a park discovery app in Nigeria.

Based ONLY on the following REAL data about this specific park, generate accurate insights.
Do NOT make up information. If something cannot be determined from the data, say "Not verified".

PARK DATA:
- Name: ${park.name || "Unknown"}
- City/Location: ${park.city || park.location || "Unknown"}
- Description: ${park.description || park.summary || "No description available"}
- Condition: ${park.condition || "Unknown"}
- Pricing: ${park.pricing || "Unknown"}
- Access Type: ${park.access_type || "Unknown"}

USER REVIEWS (${reviews?.length || 0} total):
${reviewTexts ? `- ${reviewTexts}` : "No reviews yet."}

Respond with ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "ai_summary": "A 2-3 sentence summary about THIS specific park based on the real data and reviews above. Mention the park by name. Be honest about what is known.",
  "facilities": ["list", "of", "facilities", "mentioned in description or reviews. Only include what is actually mentioned or can be reasonably inferred. If none are clear, return empty array."],
  "crowd_level": "Based on reviews: Quiet/Moderate/Busy, or 'Not verified' if unknown",
  "cleanliness": "Based on reviews/condition: Excellent/Good/Fair/Poor, or 'Not verified' if unknown",
  "safety_perception": "Based on reviews: High/Moderate/Low, or 'Not verified' if unknown",
  "visiting_hours": "Only if mentioned in description or reviews, otherwise 'Contact park for hours'"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    const parsed = JSON.parse(text);
    aiCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch (err) {
    console.error("Gemini park insights error:", err.message);
    return null;
  }
};

// Fetch all parks
const getAllParks = async (req, res) => {
  const { data, error } = await supabase
    .from("parks")
    .select("*");

  if (error) return res.status(400).json(error);

  res.json(data);
};

// Helper: calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// Enrich a single park: fetch full details + reviews + AI insights
const enrichPark = async (req, res) => {
  try {
    const parkId = req.params.parkId;

    // Fetch the park
    const { data: park, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", parkId)
      .single();

    if (error || !park) {
      return res.status(404).json({ error: "Park not found" });
    }

    // Fetch reviews for this park
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("park_id", parkId)
      .order("created_at", { ascending: false });

    // Generate AI insights from real data (non-blocking: if it fails, we still return the park)
    let aiInsights = null;
    try {
      aiInsights = await generateParkInsights(park, reviews || []);
    } catch (aiErr) {
      console.log("AI insights unavailable, returning raw park data");
    }

    res.json({
      ...park,
      reviews: reviews || [],
      reviews_count: (reviews || []).length,
      // Merge AI-generated insights (only if available)
      ...(aiInsights || {}),
    });
  } catch (err) {
    console.error("Error enriching park:", err);
    res.status(500).json({ error: "Failed to enrich park data" });
  }
};

// NEW: Get nearby parks
const getNearbyParks = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const limit = parseInt(req.query.limit) || 5;

    // Fetch parks with all fields to populate frontend (including image_url for pictures)
    const { data: parks, error } = await supabase
      .from("parks")
      .select("*");

    if (error) throw error;

    // Fetch reviews for parks
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("park_id, review_text");

    if (reviewError) throw reviewError;

    // Calculate distance and attach number of reviews
    const parksWithDistance = parks.map(park => {
      const parkReviews = reviews.filter(r => r.park_id === park.id);
      return {
        ...park,
        distance: getDistance(userLat, userLng, park.latitude, park.longitude),
        reviews_count: parkReviews.length, // total reviews
        latest_review: parkReviews[parkReviews.length - 1]?.review_text || null
      };
    });

    // Sort by distance and return top N
    parksWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(parksWithDistance.slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby parks" });
  }
};

// Get a single park by ID
const getParkById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: park, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !park) {
      return res.status(404).json({ error: "Park not found" });
    }

    res.json(park);
  } catch (err) {
    console.error("Error fetching park:", err);
    res.status(500).json({ error: "Failed to fetch park" });
  }
};

module.exports = { getAllParks, getNearbyParks, getParkById, enrichPark };
