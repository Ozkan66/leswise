import UserProfile from '../../components/UserProfile';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <UserProfile />
    </AuthenticatedLayout>
  );
}