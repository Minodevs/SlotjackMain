import React from 'react';
import { Metadata } from 'next';
import { generateStaticParams } from './generateStaticParams';
import ResetPasswordClient from './ResetPasswordClient';

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Şifre Sıfırlama | Topluluk',
  description: 'Hesabınızın şifresini sıfırlayın.',
};

export { generateStaticParams };

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordClient params={params} />;
} 