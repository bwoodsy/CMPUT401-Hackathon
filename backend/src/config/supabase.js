const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate that the environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  console.error('   Get these from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

// Create and export the client
// This client is reused across all route files
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;