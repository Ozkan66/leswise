"use client";
import GroupList from "../../components/GroupList";
import GroupCreateForm from "../../components/GroupCreateForm";
import JoinGroupForm from "../../components/JoinGroupForm";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { useState } from "react";

export default function GroupsPage() {
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = () => setRefresh((r) => r + 1);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Groups Management</h1>
            <p className="text-muted-foreground">
              Create new groups for your classes or communities, or join existing groups using a jumper code.
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <GroupCreateForm onGroupCreated={handleRefresh} />
              <JoinGroupForm onGroupJoined={handleRefresh} />
            </div>

            <GroupList key={refresh} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
