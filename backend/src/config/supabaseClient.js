// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Supabase client not fully configured. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment."
  );
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

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
