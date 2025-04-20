const { builder } = require('@netlify/functions');

// This file sets up the Next.js server-side rendering function
const nextFunction = async (req, context) => {
  try {
    console.log('Request received:', {
      path: req.path,
      rawUrl: req.rawUrl,
      headers: req.headers,
      method: req.method
    });

    // Handle static assets separately - let Netlify CDN handle them
    const path = req.path || '/';
    if (path.startsWith('/_next/static/') ||
        path.startsWith('/static/') ||
        path.endsWith('.ico') ||
        path.endsWith('.txt') ||
        path.endsWith('.png') ||
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.webp') ||
        path.endsWith('.svg')) {
      console.log('Skipping static asset:', path);
      return {
        statusCode: 404,
        body: 'Not found'
      };
    }

    // Pass the request to Next.js handler, which contains proper routing logic
    console.log('Handling server-side rendering for path:', path);
    const { default: handler } = await import('@netlify/next');
    return await handler(req, context);
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <html>
          <head>
            <title>Server Error</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #121212;
                color: #fff;
                padding: 30px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { color: #ff6b00; }
              pre {
                background: #242424;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            <h1>Server Error</h1>
            <p>The server encountered an error while processing your request. Please try again later.</p>
            <p>If you're the site administrator, check the function logs for more details.</p>
            <pre>${process.env.NODE_ENV === 'development' ? error.stack : 'Error details hidden in production'}</pre>
          </body>
        </html>
      `
    };
  }
};

exports.handler = builder(nextFunction); 