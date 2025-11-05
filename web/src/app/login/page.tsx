import LoginForm from '../../components/LoginForm';
import PageLayout from '../../components/PageLayout';

export default function LoginPage() {
  return (
    <PageLayout 
      maxWidth="sm" 
      showHeader={false}
    >
      <LoginForm />
    </PageLayout>
  );
}