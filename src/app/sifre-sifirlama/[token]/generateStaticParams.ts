// This file handles static param generation for token-based routes
export function generateStaticParams() {
  // For password reset tokens, we typically wouldn't pre-render these
  // since they're dynamically generated and short-lived.
  // But for static builds, we'll include several examples.
  return [
    { token: 'example-reset-token' },
    { token: 'expired-token' },
    { token: 'valid-token-example' },
    { token: '123456789abcdef' },
    { token: 'test-reset-token' }
  ];
} 