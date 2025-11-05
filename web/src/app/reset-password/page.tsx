import ResetPasswordForm from '../../components/ResetPasswordForm';
import PageLayout from '../../components/PageLayout';

export default function ResetPasswordPage() {
  return (
    <PageLayout 
      maxWidth="sm" 
      showHeader={false}
    >
      <ResetPasswordForm />
    </PageLayout>
  );
}