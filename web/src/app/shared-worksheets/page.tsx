"use client";
import SharedWorksheetsManager from "../../components/SharedWorksheetsManager";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";

export default function SharedWorksheetsPage() {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Shared Worksheets</h1>
            <p className="text-muted-foreground">Bekijk werkbladen die met jou gedeeld zijn en deel je eigen werkbladen met anderen.</p>
          </div>

          <SharedWorksheetsManager />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}