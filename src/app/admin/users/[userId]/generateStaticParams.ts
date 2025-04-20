// This file handles static param generation for all [userId] routes
export function generateStaticParams() {
  // In a real app, you would fetch this data from your database
  // For now, we'll just return an example userId for pre-rendering
  return [
    { userId: 'example-user-id' }
  ];
} 