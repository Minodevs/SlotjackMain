// This file handles static param generation for token-based routes
export function generateStaticParams() {
  // For password reset tokens, we typically wouldn't pre-render these
  // since they're dynamically generated and short-lived.
  // But for build purposes, we'll include an example.
  return [
    { token: 'example-reset-token' }
  ];
} 