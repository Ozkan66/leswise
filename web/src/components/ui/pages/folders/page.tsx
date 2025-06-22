"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen } from "lucide-react"

export default function FoldersPage() {
  const [folderName, setFolderName] = useState("")
  const [folders, setFolders] = useState([
    { id: 1, name: "wiskunde_folder", worksheets: 5 },
    { id: 2, name: "nederlands_folder", worksheets: 3 },
  ])

  const navigationItems = [
    { id: "groups", label: "Groups", active: false },
    { id: "folders", label: "Folders", active: true },
    { id: "worksheets", label: "Worksheets", active: false },
    { id: "shared-worksheets", label: "Shared Worksheets", active: false },
    { id: "submissions", label: "Submissions", active: false },
    { id: "mijn-werkbladen", label: "Mijn Werkbladen", active: false },
    { id: "teacher-submissions", label: "Teacher Submissions", active: false },
  ]

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      const newFolder = {
        id: folders.length + 1,
        name: folderName,
        worksheets: 0,
      }
      setFolders([...folders, newFolder])
      setFolderName("")
    }
  }

  const handleDeleteFolder = (id: number) => {
    setFolders(folders.filter((folder) => folder.id !== id))
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
        {/* Create New Folder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label htmlFor="folder-name">Folder name</Label>
                <Input
                  id="folder-name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </div>
          </CardContent>
        </Card>

        {/* Folders List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Folders</CardTitle>
          </CardHeader>
          <CardContent>
            {folders.length > 0 ? (
              <div className="space-y-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-medium">{folder.name}</span>
                        <p className="text-sm text-gray-500">{folder.worksheets} worksheets</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No folders created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
