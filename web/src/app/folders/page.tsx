"use client";
import FolderList from "../../components/FolderList";
import FolderCreateForm from "../../components/FolderCreateForm";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { useState } from "react";

export default function FoldersPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Folders</h1>
            <p className="text-muted-foreground">Organiseer je werkbladen in mappen voor betere structuur en overzicht.</p>
          </div>

          <div className="space-y-6">
            <FolderCreateForm onFolderCreated={() => setRefresh((r) => r + 1)} />
            <FolderList key={refresh} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
