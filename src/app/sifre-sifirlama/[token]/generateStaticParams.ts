// This is used for static export
export function generateStaticParams() {
  return [
    { token: 'example-reset-token' },
    { token: 'expired-token' },
    { token: 'valid-token-example' },
    { token: '123456789abcdef' },
    { token: 'test-reset-token' },
  ];
} 