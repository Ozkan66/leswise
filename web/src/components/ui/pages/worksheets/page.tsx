"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function WorksheetsPage() {
  const [worksheetTitle, setWorksheetTitle] = useState("")
  const [worksheetDescription, setWorksheetDescription] = useState("")
  const [worksheetInstructions, setWorksheetInstructions] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("No folder")
  const [worksheetStatus, setWorksheetStatus] = useState("Draft (work in progress)")

  const navigationItems = [
    { id: "groups", label: "Groups", active: false },
    { id: "folders", label: "Folders", active: false },
    { id: "worksheets", label: "Worksheets", active: true },
    { id: "shared-worksheets", label: "Shared Worksheets", active: false },
    { id: "submissions", label: "Submissions", active: false },
    { id: "mijn-werkbladen", label: "Mijn Werkbladen", active: false },
    { id: "teacher-submissions", label: "Teacher Submissions", active: false },
  ]

  const existingWorksheets = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      status: "PUBLISHED",
      instructions: "Los Op!",
    },
  ]

  const handleCreateWorksheet = () => {
    // This would typically navigate to the worksheet editor
    console.log("Creating worksheet:", {
      title: worksheetTitle,
      description: worksheetDescription,
      instructions: worksheetInstructions,
      folder: selectedFolder,
      status: worksheetStatus,
    })
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
            <Link href="/worksheets/create">
              <Button size="sm">Create Worksheet</Button>
            </Link>
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
        {/* Create New Worksheet */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Worksheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title:</Label>
              <Input
                id="title"
                value={worksheetTitle}
                onChange={(e) => setWorksheetTitle(e.target.value)}
                placeholder="Worksheet title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description:</Label>
              <Textarea
                id="description"
                value={worksheetDescription}
                onChange={(e) => setWorksheetDescription(e.target.value)}
                placeholder="Brief description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions for Students:</Label>
              <Textarea
                id="instructions"
                value={worksheetInstructions}
                onChange={(e) => setWorksheetInstructions(e.target.value)}
                placeholder="Instructions for students (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="folder">Folder:</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No folder">No folder</SelectItem>
                    <SelectItem value="wiskunde_folder">wiskunde_folder</SelectItem>
                    <SelectItem value="nederlands_folder">nederlands_folder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status:</Label>
                <Select value={worksheetStatus} onValueChange={setWorksheetStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft (work in progress)">Draft (work in progress)</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateWorksheet}>Create Worksheet</Button>
          </CardContent>
        </Card>

        {/* Existing Worksheets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Worksheets</CardTitle>
          </CardHeader>
          <CardContent>
            {existingWorksheets.length > 0 ? (
              <div className="space-y-4">
                {existingWorksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{worksheet.title}</span>
                        <Badge variant={worksheet.status === "PUBLISHED" ? "default" : "secondary"}>
                          {worksheet.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {worksheet.subject} • {worksheet.instructions}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        Submit Answers
                      </Button>
                      <Link href={`/worksheets/${worksheet.id}/edit`}>
                        <Button size="sm">Edit</Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No worksheets created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
