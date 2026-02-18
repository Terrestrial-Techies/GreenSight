const supabase = require("../config/supabaseClient");

const getRecommendations = async (preference) => {
  // Fetch all parks
  const { data: parks, error } = await supabase
    .from("parks")
    .select("*");

  if (error) throw error;

  // Simple filtering logic
  let filteredParks = parks;

  if (preference === "quiet") {
    filteredParks = parks.filter(
      p => p.access_type === "Public" && p.confidence_score > 60
    );
  } else if (preference === "family") {
    filteredParks = parks.filter(p => p.confidence_score > 50);
  }

  // Sort by confidence score descending
  filteredParks.sort((a, b) => b.confidence_score - a.confidence_score);

  // Return top 5
  return filteredParks.slice(0, 5);
};

module.exports = { getRecommendations };
