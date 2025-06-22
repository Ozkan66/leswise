"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function GroupsPage() {
  const [groupName, setGroupName] = useState("")
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "wiskunde",
      code: "LZJKNS",
      members: 24,
      pendingMembers: 2,
      worksheets: 5,
      created: "2024-01-01",
    },
    {
      id: 2,
      name: "nederlands_4a",
      code: "MK8PQR",
      members: 18,
      pendingMembers: 0,
      worksheets: 3,
      created: "2024-01-05",
    },
  ])

  const navigationItems = [
    { id: "groups", label: "Groups", active: true },
    { id: "folders", label: "Folders", active: false },
    { id: "worksheets", label: "Worksheets", active: false },
    { id: "shared-worksheets", label: "Shared Worksheets", active: false },
    { id: "submissions", label: "Submissions", active: false },
    { id: "mijn-werkbladen", label: "Mijn Werkbladen", active: false },
    { id: "teacher-submissions", label: "Teacher Submissions", active: false },
  ]

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      const newGroup = {
        id: groups.length + 1,
        name: groupName,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: 0,
        pendingMembers: 0,
        worksheets: 0,
        created: new Date().toISOString().split("T")[0],
      }
      setGroups([...groups, newGroup])
      setGroupName("")
    }
  }

  const handleDeleteGroup = (id: number) => {
    setGroups(groups.filter((group) => group.id !== id))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-gray-900">Leswise</h1>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <Button key={item.id} variant={item.active ? "default" : "ghost"} size="sm" className="text-sm">
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welkom, Ozkan</span>
              <Button variant="ghost" size="sm">
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Create New Group */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label htmlFor="group-name">Group name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length > 0 ? (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{group.name}</span>
                        <Badge variant="outline">(Code: {group.code})</Badge>
                        {group.pendingMembers > 0 && <Badge variant="secondary">{group.pendingMembers} pending</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {group.members} members • {group.worksheets} worksheets
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No groups created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
