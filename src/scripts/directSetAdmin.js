// Script to directly make a user an admin by updating their rank in Supabase
// Usage: node src/scripts/directSetAdmin.js [email]

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get the email from command line args or use default
const email = process.argv[2] || 'sezarpaypals2@gmail.com';

async function setAdmin() {
  console.log(`\n🔑 Setting user ${email} as admin...\n`);
  
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    return;
  }
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // First check if the user exists
    console.log('Checking if user exists...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user:', userError.message);
      return;
    }
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      return;
    }
    
    console.log('✅ User found:', user);
    
    // Update the user's rank to admin
    console.log('Updating user rank to admin...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ rank: 'admin' })
      .eq('email', email);
    
    if (updateError) {
      console.error('❌ Error updating user rank:', updateError.message);
      return;
    }
    
    console.log(`\n✅ Successfully set ${email} as admin!`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setAdmin(); 