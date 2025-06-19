"use client";
import GroupList from "../../components/GroupList";
import GroupCreateForm from "../../components/GroupCreateForm";
import { useState } from "react";

export default function GroupsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div>
      <h1>Groups</h1>
      <GroupCreateForm onGroupCreated={() => setRefresh((r) => r + 1)} />
      <GroupList key={refresh} />
    </div>
  );
}
