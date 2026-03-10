const { createClient } = require('@supabase/supabase-js');

console.log('=== Supabase Config Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('===========================');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials:');
  console.error('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('  SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  throw new Error("Missing Supabase backend credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

if (typeof supabaseKey === "string" && supabaseKey.startsWith("sb_publishable_")) {
  throw new Error("Invalid Supabase backend key: publishable key detected. Use SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log('✅ Supabase client initialized successfully');
module.exports = supabase;
