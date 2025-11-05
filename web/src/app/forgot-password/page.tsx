import ForgotPasswordForm from '../../components/ForgotPasswordForm';
import PageLayout from '../../components/PageLayout';

export default function ForgotPasswordPage() {
  return (
    <PageLayout 
      maxWidth="sm" 
      showHeader={false}
    >
      <ForgotPasswordForm />
    </PageLayout>
  );
}