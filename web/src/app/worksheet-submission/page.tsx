import { Suspense } from "react";
import WorksheetSubmissionContent from "./WorksheetSubmissionContent";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <WorksheetSubmissionContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}
