"use client";
import GroupList from "../../components/GroupList";
import GroupCreateForm from "../../components/GroupCreateForm";
import JoinGroupForm from "../../components/JoinGroupForm";
import PageLayout from "../../components/PageLayout";
import { useState } from "react";

export default function GroupsPage() {
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = () => setRefresh((r) => r + 1);

  return (
    <PageLayout
      title="Groups Management"
      description="Create new groups for your classes or communities, or join existing groups using a jumper code."
      maxWidth="lg"
    >
      <div className="space-y-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <GroupCreateForm onGroupCreated={handleRefresh} />
          <JoinGroupForm onGroupJoined={handleRefresh} />
        </div>
        
        <GroupList key={refresh} />
      </div>
    </PageLayout>
  );
}
