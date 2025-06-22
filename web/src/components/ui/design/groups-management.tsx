"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Edit, Trash2, Copy, UserPlus, Settings, Share2 } from "lucide-react"

export default function GroupsManagement() {
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600">Manage your student groups and class organizations</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Create New Group */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create New Group</span>
            </CardTitle>
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

        {/* Groups Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Your Groups</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length > 0 ? (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                          <Badge variant="outline" className="font-mono">
                            Code: {group.code}
                          </Badge>
                          {group.pendingMembers > 0 && (
                            <Badge variant="secondary">{group.pendingMembers} pending</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{group.members} members</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Share2 className="w-4 h-4" />
                            <span>{group.worksheets} worksheets</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Created: {group.created}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(group.code)}
                              className="h-auto p-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Code
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Join Instructions:</strong> Students can join this group by entering the code{" "}
                            <strong>{group.code}</strong> or by using this link:
                          </p>
                          <div className="flex items-center space-x-2">
                            <code className="bg-white px-2 py-1 rounded text-xs border">
                              https://leswise.app/join/{group.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`https://leswise.app/join/${group.code}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Group Settings: {group.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Group Name</Label>
                                <Input defaultValue={group.name} />
                              </div>
                              <div>
                                <Label>Join Code</Label>
                                <div className="flex items-center space-x-2">
                                  <Input value={group.code} readOnly />
                                  <Button variant="outline" size="sm">
                                    Regenerate
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Members
                        </Button>

                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-600">Create your first group to start organizing your students.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
