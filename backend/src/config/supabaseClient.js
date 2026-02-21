const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
// Prefer the anon/public key if available, otherwise fall back to service key.
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase client not fully configured. Check SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

module.exports = supabase;
