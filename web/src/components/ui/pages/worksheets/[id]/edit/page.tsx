"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Share2,
  ArrowLeft,
  FileText,
  CheckSquare,
  Circle,
  Type,
  AlignLeft,
  ArrowUpDown,
} from "lucide-react"
import Link from "next/link"

export default function WorksheetEditPage({ params }: { params: { id: string } }) {
  const [worksheetTitle, setWorksheetTitle] = useState("Wiskunde taak")
  const [worksheetDescription, setWorksheetDescription] = useState("")
  const [worksheetInstructions, setWorksheetInstructions] = useState("Los Op!")

  const worksheetElements = [
    {
      id: 1,
      type: "MULTIPLE CHOICE",
      points: 1,
      question: "Hoofdsteden in Europa?",
      options: ["A. Brussel ✓", "B. Athene ✓", "C. Ankara"],
      correct: ["A", "B"],
    },
    {
      id: 2,
      type: "TEXT",
      points: 1,
      content: "Geef uitleg over Covid.",
    },
    {
      id: 3,
      type: "SINGLE CHOICE",
      points: 1,
      question: "Is de hoofdstad van Duitsland Berlijn?",
      options: ["A. Ja ✓", "B. Neen"],
      correct: ["A"],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/worksheets">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Worksheet: {worksheetTitle}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link href={`/worksheets/${params.id}/preview`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Link href={`/worksheets/${params.id}/share`}>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </Link>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="tasks">Add Tasks</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {/* Worksheet Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Worksheet Elements</CardTitle>
                <p className="text-sm text-gray-600">Drag and drop to reorder elements</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worksheetElements.map((element, index) => (
                    <div
                      key={element.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">
                              {index + 1}. {element.type}
                            </Badge>
                            <Badge variant="secondary">{element.points} PTS</Badge>
                          </div>

                          {element.question && <p className="font-medium text-gray-900 mb-2">{element.question}</p>}

                          {element.content && <p className="text-gray-700 mb-2">{element.content}</p>}

                          {element.options && (
                            <div className="space-y-1">
                              {element.options.map((option, optIndex) => (
                                <p key={optIndex} className="text-sm text-gray-600">
                                  {option}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/worksheets/${params.id}/edit/task/${element.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link href={`/worksheets/${params.id}/edit/task/new`}>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Task
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Worksheet Settings</CardTitle>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: "multiple-choice", label: "Multiple Choice", icon: CheckSquare },
                    { type: "single-choice", label: "Single Choice", icon: Circle },
                    { type: "short-answer", label: "Short Answer", icon: Type },
                    { type: "essay", label: "Essay", icon: AlignLeft },
                    { type: "ordering", label: "Ordering", icon: ArrowUpDown },
                    { type: "text-info", label: "Text/Information", icon: FileText },
                  ].map((taskType) => {
                    const Icon = taskType.icon
                    return (
                      <Link key={taskType.type} href={`/worksheets/${params.id}/edit/task/new?type=${taskType.type}`}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-6 text-center">
                            <Icon className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                            <h3 className="font-medium">{taskType.label}</h3>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Worksheet Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Share this worksheet to start receiving submissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
