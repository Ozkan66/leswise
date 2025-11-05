import RegisterForm from '../../components/RegisterForm';
import PageLayout from '../../components/PageLayout';

export default function RegisterPage() {
  return (
    <PageLayout 
      maxWidth="sm" 
      showHeader={false}
    >
      <RegisterForm />
    </PageLayout>
  );
}