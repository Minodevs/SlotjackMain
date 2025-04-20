// This file handles static param generation for all [userId] routes
export function generateStaticParams() {
  // In a real app, you would fetch this data from your database
  // For static builds, we include several example userIds for pre-rendering
  return [
    { userId: 'example-user-id' },
    { userId: 'test-user' },
    { userId: 'admin-user' },
    { userId: '12345' },
    { userId: 'johndoe' }
  ];
} 