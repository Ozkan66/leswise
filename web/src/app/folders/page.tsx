"use client";
import FolderList from "../../components/FolderList";
import FolderCreateForm from "../../components/FolderCreateForm";
import { useState } from "react";

export default function FoldersPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div>
      <h1>Folders</h1>
      <FolderCreateForm onFolderCreated={() => setRefresh((r) => r + 1)} />
      <FolderList key={refresh} />
    </div>
  );
}
