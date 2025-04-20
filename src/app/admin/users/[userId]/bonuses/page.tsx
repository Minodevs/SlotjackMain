import { generateStaticParams } from './generateStaticParams';
import BonusesClient from './BonusesClient';

export { generateStaticParams };

export default function BonusesPage({ params }: { params: { userId: string } }) {
  return <BonusesClient params={params} />;
} 