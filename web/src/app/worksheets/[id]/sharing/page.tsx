"use client";

import { useParams, useRouter } from "next/navigation";
import WorksheetSharingForm from "@/components/WorksheetSharingForm";
import { useState } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { ArrowLeft } from "lucide-react";

export default function WorksheetSharingPage() {
  const params = useParams();
  const router = useRouter();
  const worksheetId = params?.id as string;
  const [open, setOpen] = useState(true);

  // Je zou hier eventueel de worksheet title kunnen fetchen indien gewenst
  // Voor nu placeholder:
  const worksheetTitle = "Werkblad delen";

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </button>

          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{worksheetTitle}</h2>
            {open && (
              <WorksheetSharingForm
                worksheetId={worksheetId}
                worksheetTitle={worksheetTitle}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
