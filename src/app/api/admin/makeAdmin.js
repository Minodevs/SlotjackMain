// Server-side script for making a user admin
// This is a simplified version for development purposes
// In production, this should have proper authentication and authorization

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase credentials' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError || !user) {
      // If not found, try to create a user with admin privileges
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: email,
          rank: 'admin',
          name: 'Admin User',
          jackPoints: 1000,
          verified: true,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          transactions: []
        });
        
      if (createError) {
        console.error('Error creating admin user:', createError);
        return res.status(500).json({ error: 'Failed to create admin user' });
      }
      
      return res.status(201).json({
        success: true,
        message: `Admin user ${email} has been created`,
        user: newUser
      });
    }
    
    // Update the user's rank to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ rank: 'admin' })
      .eq('email', email);

    if (error) {
      console.error('Error updating user rank:', error);
      return res.status(500).json({ error: 'Failed to update user rank' });
    }

    return res.status(200).json({
      success: true,
      message: `User ${email} has been promoted to admin`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
} 