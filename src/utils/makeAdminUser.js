// Utility script to make a user an admin
// Run this script with: node src/utils/makeAdminUser.js
// Make sure you have appropriate permissions to modify the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Get email from command line arguments or use default
const userEmail = process.argv[2] || 'sezarpaypals2@gmail.com';

async function makeUserAdmin(email) {
  console.log(`Attempting to make user with email ${email} an admin...`);

  // Initialize the Supabase client with the service role key for admin privileges
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError.message);
      return;
    }

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log('Found user:', user);

    // Update the user's rank to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ rank: 'admin' })
      .eq('email', email);

    if (error) {
      console.error('Error updating user rank:', error.message);
      return;
    }

    console.log(`Successfully updated user ${email} to admin rank!`);
    
    // Verify the change
    const { data: verifyUser, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
      
    if (verifyError) {
      console.error('Error verifying update:', verifyError.message);
      return;
    }
    
    console.log('User information after update:', verifyUser);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Execute the function
makeUserAdmin(userEmail); 