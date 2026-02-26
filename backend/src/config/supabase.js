const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase backend credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

if (typeof supabaseKey === "string" && supabaseKey.startsWith("sb_publishable_")) {
  console.warn("Supabase backend is using a publishable key. Storage writes may fail under RLS. Use SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;

