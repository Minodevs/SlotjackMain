const { builder } = require('@netlify/functions');

// This file sets up the Next.js server-side rendering function
const nextFunction = async (req, context) => {
  // Get the path from the request
  const url = new URL(req.url);
  
  // If we're handling a static asset, skip this function (handled by Netlify CDN)
  if (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/static/') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.txt') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.svg')) {
    return {
      statusCode: 404,
      body: 'Not found'
    };
  }
  
  console.log(`Server-side rendering requested for: ${url.pathname}`);
  
  try {
    const { default: handler } = await import('@netlify/next');
    return await handler(req, context);
  } catch (error) {
    console.error('Error rendering page with Next.js:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};

exports.handler = builder(nextFunction); 