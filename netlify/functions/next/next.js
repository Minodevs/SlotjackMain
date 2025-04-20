// Minimal Lambda function for Next.js on Netlify
const { builder } = require('@netlify/functions');

exports.handler = builder(async (req, context) => {
  try {
    // Skip static assets
    if (/\._next\/static\/|\/static\/|\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/.test(req.path)) {
      return { statusCode: 404, body: 'Not found' };
    }

    // Dynamically import the handler only when needed
    const { default: handler } = await import('@netlify/next');
    return await handler(req, context);
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: 'Server Error'
    };
  }
}); 