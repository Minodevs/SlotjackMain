import { generateStaticParams } from './generateStaticParams';
import AwardsClient from './AwardsClient';

export { generateStaticParams };

export default function AwardsPage({ params }: { params: { userId: string } }) {
  return <AwardsClient params={params} />;
} 