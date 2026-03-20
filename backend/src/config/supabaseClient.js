const { createClient } = require('@supabase/supabase-js');

console.log('=== Supabase Client Config Debug ===');
console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('====================================');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in supabaseClient.js:');
  console.error('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  throw new Error("Missing Supabase backend credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized successfully');
module.exports = supabase;
