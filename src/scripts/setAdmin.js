// Script to make a user an admin by calling the API endpoint
// Usage: node src/scripts/setAdmin.js

const fetch = require('node-fetch');
const email = process.argv[2] || 'sezarpaypals2@gmail.com';

async function makeAdmin() {
  console.log(`\n🔑 Setting user with email ${email} as an admin...\n`);
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/make-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error: ${data.error || response.statusText}`);
      return;
    }
    
    console.log(`✅ Success: ${data.message}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeAdmin(); 