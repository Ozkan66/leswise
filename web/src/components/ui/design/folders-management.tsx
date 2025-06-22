"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, Plus, Edit, Trash2, FileText, Folder } from "lucide-react"

export default function FoldersManagement() {
  const [folderName, setFolderName] = useState("")
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: "wiskunde_folder",
      worksheets: 5,
      created: "2024-01-01",
      lastModified: "2024-01-10",
    },
    {
      id: 2,
      name: "nederlands_folder",
      worksheets: 3,
      created: "2024-01-05",
      lastModified: "2024-01-08",
    },
    {
      id: 3,
      name: "geschiedenis_folder",
      worksheets: 7,
      created: "2024-01-03",
      lastModified: "2024-01-12",
    },
  ])

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      const newFolder = {
        id: folders.length + 1,
        name: folderName,
        worksheets: 0,
        created: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Folders</h1>
            <p className="text-gray-600">Organize your worksheets into folders for better management</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Create New Folder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create New Folder</span>
            </CardTitle>
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

        {/* Folders Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Your Folders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {folders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => (
                  <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Folder className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                            <p className="text-sm text-gray-500">
                              {folder.worksheets} worksheet{folder.worksheets !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Created:</span>
                          <span>{folder.created}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Last modified:</span>
                          <span>{folder.lastModified}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{folder.worksheets} items</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                <p className="text-gray-600">Create your first folder to organize your worksheets.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
