"use client";
import GroupList from "../../components/GroupList";
import GroupCreateForm from "../../components/GroupCreateForm";
import JoinGroupForm from "../../components/JoinGroupForm";
import { useState } from "react";

export default function GroupsPage() {
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = () => setRefresh((r) => r + 1);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <h1>Groups Management</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Create new groups for your classes or communities, or join existing groups using a jumper code.
      </p>
      
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', marginBottom: 32 }}>
        <GroupCreateForm onGroupCreated={handleRefresh} />
        <JoinGroupForm onGroupJoined={handleRefresh} />
      </div>
      
      <GroupList key={refresh} />
    </div>
  );
}
