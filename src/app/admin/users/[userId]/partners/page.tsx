import { generateStaticParams } from './generateStaticParams';
import PartnersClient from './PartnersClient';

export { generateStaticParams };

export default function PartnersPage({ params }: { params: { userId: string } }) {
  return <PartnersClient params={params} />;
} 