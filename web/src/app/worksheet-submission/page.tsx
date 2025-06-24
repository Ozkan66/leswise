import { Suspense } from "react";
import WorksheetSubmissionContent from "./WorksheetSubmissionContent";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorksheetSubmissionContent />
    </Suspense>
  );
}
