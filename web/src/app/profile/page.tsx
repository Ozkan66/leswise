import UserProfile from '../../components/UserProfile';
import PageLayout from '../../components/PageLayout';

export default function ProfilePage() {
  return (
    <PageLayout 
      maxWidth="sm" 
      showHeader={false}
    >
      <UserProfile />
    </PageLayout>
  );
}