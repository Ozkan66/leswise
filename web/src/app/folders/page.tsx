"use client";
import FolderList from "../../components/FolderList";
import FolderCreateForm from "../../components/FolderCreateForm";
import PageLayout from "../../components/PageLayout";
import { useState } from "react";

export default function FoldersPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <PageLayout
      title="Folders"
      description="Organiseer je werkbladen in mappen voor betere structuur en overzicht."
      maxWidth="lg"
    >
      <div className="space-y-6">
        <FolderCreateForm onFolderCreated={() => setRefresh((r) => r + 1)} />
        <FolderList key={refresh} />
      </div>
    </PageLayout>
  );
}
