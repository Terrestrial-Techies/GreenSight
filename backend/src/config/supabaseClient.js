// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Only log internally, do not expose to user
  console.error(
    "Supabase client not fully configured. Make sure SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY are set in your environment."
  );
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

// Optional: Wrapper function for queries to handle generic errors
const safeQuery = async (queryFunc) => {
  try {
    const { data, error } = await queryFunc();
    if (error) {
      console.error("Supabase query error:", error);
      return { data: null, error: "An error occurred. Please try again." };
    }
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected Supabase error:", err);
    return { data: null, error: "An error occurred. Please try again." };
  }
};

module.exports = { supabase, safeQuery };
