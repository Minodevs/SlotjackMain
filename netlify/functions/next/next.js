const { builder } = require('@netlify/functions');

// This file sets up the Next.js server-side rendering function
// Using a lightweight handler that dynamically imports the actual handler
const nextFunction = async (req, context) => {
  try {
    // Minimal logging to reduce bundle size
    console.log(`Request: ${req.method} ${req.path}`);

    // Skip static assets - let Netlify CDN handle them
    const path = req.path || '/';
    if (path.match(/\.(ico|png|jpg|jpeg|webp|svg|css|js|woff|woff2|ttf|otf|mp4|webm|gif)$/) ||
        path.startsWith('/_next/static/') ||
        path.startsWith('/static/')) {
      return { statusCode: 404, body: 'Not found' };
    }

    // Dynamically import the Next.js handler to reduce initial bundle size
    // This is crucial for staying under Netlify's function size limits
    const { default: handler } = await import('@netlify/next');
    return await handler(req, context);
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<html><body><h1>Server Error</h1><p>${error.message}</p></body></html>`
    };
  }
};

// Use the builder function with minimal configuration
exports.handler = builder(nextFunction); 