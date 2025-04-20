import { generateStaticParams } from './generateStaticParams';
import UserProfileClient from './UserProfileClient';

export { generateStaticParams };

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return <UserProfileClient params={params} />;
}
