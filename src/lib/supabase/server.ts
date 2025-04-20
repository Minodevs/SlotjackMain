import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Polyfill fetch for Node environments
let nodeFetch: typeof fetch | undefined;
if (typeof window === 'undefined') {
  // Only import in server context
  try {
    // Use native Node 18+ fetch if available
    nodeFetch = global.fetch;
  } catch (e) {
    console.warn('Native fetch not available, using polyfill would be needed');
  }
}

// Helper function to add delay for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createClient = async (retryCount = 3) => {
  try {
    console.log('Creating server-side Supabase client...');
    const cookieStore = cookies();
    
    // Get environment variables and clean any white space or line breaks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:',
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
        !supabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : '');
      throw new Error('Missing required Supabase configuration');
    }

    // Create the Supabase client with error handling and retries
    let lastError = null;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${retryCount} to create Supabase client`);
        
        const client = createServerClient(
          supabaseUrl,
          supabaseKey,
          {
            cookies: {
              get(name: string) {
                return cookieStore.get(name)?.value;
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
            global: {
              fetch: nodeFetch,
              headers: {
                'X-Client-Info': 'next-server-supabase'
              }
            },
            db: {
              schema: 'public'
            },
            realtime: {
              timeout: 10000 // 10 seconds
            }
          }
        );
        
        // Simple connectivity test
        try {
          const healthCheck = await client.from('health_check').select('*').limit(1).maybeSingle();
          if (healthCheck.error) {
            console.warn(`Health check failed on attempt ${attempt}:`, healthCheck.error);
            throw healthCheck.error;
          }
          console.log('Supabase server client created and verified successfully');
        } catch (healthError: any) {
          // If it's a "relation does not exist" error, that's actually ok - the table might not exist
          if (healthError.message && healthError.message.includes('relation "health_check" does not exist')) {
            console.log('Health check table does not exist, but connection seems good');
          } else {
            throw healthError;
          }
        }
        
        return client;
      } catch (clientError) {
        lastError = clientError;
        console.error(`Failed to initialize Supabase client (attempt ${attempt}/${retryCount}):`, clientError);
        
        if (attempt < retryCount) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          const backoffTime = Math.min(500 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${backoffTime}ms...`);
          await delay(backoffTime);
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw new Error(`Supabase client initialization failed after ${retryCount} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    throw error;
  }
} 