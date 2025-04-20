// Script to make a user an admin in Supabase
// Run with: node src/scripts/makeAdmin.js sezarpaypals2@gmail.com
// or: npm run make-admin -- sezarpaypals2@gmail.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Email to make admin (default or from command line)
const email = process.argv[2] || 'sezarpaypals2@gmail.com';

// Supabase connection info
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials. Check your .env or .env.local file.');
  process.exit(1);
}

async function makeAdmin() {
  console.log(`\n🔑 Making user with email ${email} an admin...\n`);
  
  // Initialize the Supabase client
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
      if (userError.code === 'PGRST116') {
        console.log(`User with email ${email} not found. Creating new admin user...`);
        
        // Create user with admin privileges
        const { data: newUser, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            rank: 'admin',
            name: 'Admin User',
            jackPoints: 5000, 
            verified: true,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            transactions: [],
            notifications: [],
            favorites: []
          })
          .select();
        
        if (createError) {
          console.error('ERROR creating user:', createError.message);
          return;
        }
        
        console.log('✅ Successfully created new admin user!');
        console.log(newUser);
        return;
      } else {
        console.error('ERROR fetching user:', userError.message);
        return;
      }
    }
    
    console.log('User found:', user);
    
    // Update the user's rank to admin
    console.log('Updating user rank to admin...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ rank: 'admin' })
      .eq('email', email);
    
    if (updateError) {
      console.error('ERROR updating user rank:', updateError.message);
      return;
    }
    
    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (verifyError) {
      console.error('ERROR verifying update:', verifyError.message);
      return;
    }
    
    console.log('\n✅ Successfully updated user to admin rank!');
    console.log('Updated user data:');
    console.log(updatedUser);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
makeAdmin(); 