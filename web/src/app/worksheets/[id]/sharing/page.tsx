"use client";

import { useParams } from "next/navigation";
import WorksheetSharingForm from "@/components/WorksheetSharingForm";
import { useState } from "react";

export default function WorksheetSharingPage() {
  const params = useParams();
  const worksheetId = params?.id as string;
  const [open, setOpen] = useState(true);

  // Je zou hier eventueel de worksheet title kunnen fetchen indien gewenst
  // Voor nu placeholder:
  const worksheetTitle = "Werkblad delen";

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px #0001", padding: 32 }}>
      <h2 style={{ marginBottom: 24 }}>{worksheetTitle}</h2>
      {open && (
        <WorksheetSharingForm
          worksheetId={worksheetId}
          worksheetTitle={worksheetTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
