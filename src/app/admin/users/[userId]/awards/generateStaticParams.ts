// This file handles static param generation for the awards route
export function generateStaticParams() {
  return [
    { userId: '1' },
    { userId: '2' },
    { userId: '3' },
    { userId: 'example-user' },
    { userId: 'admin-user' },
  ];
} 