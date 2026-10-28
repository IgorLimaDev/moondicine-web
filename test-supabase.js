const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cyczozmaszmymagrozic.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Y3pvem1hc3pteW1hZ3JvemljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTIxNTcsImV4cCI6MjEwMzE2ODE1N30.qz0DKXdNmI4cVx1boj-tuWmEplRZsViMs4UT69kL2LM');

async function test() {
  const { count, error } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log('questions count:', count);
  console.log('error:', error);
  
  const { data: tables } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  // This won't work with anon key, skip
}

test();
