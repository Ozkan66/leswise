"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

export default function WorksheetEditor() {
  const [worksheetTitle, setWorksheetTitle] = useState("Wiskunde taak")
  const [worksheetDescription, setWorksheetDescription] = useState("")
  const [worksheetInstructions, setWorksheetInstructions] = useState("Los Op!")
  const [selectedFolder, setSelectedFolder] = useState("No folder")
  const [worksheetStatus, setWorksheetStatus] = useState("Draft (work in progress)")

  const taskTypes = [
    {
      id: "multiple-choice",
      label: "Multiple Choice",
      icon: CheckSquare,
      description: "Multiple options, multiple correct answers",
    },
    { id: "single-choice", label: "Single Choice", icon: Circle, description: "Multiple options, one correct answer" },
    { id: "short-answer", label: "Short Answer", icon: Type, description: "Brief text response" },
    { id: "essay", label: "Essay", icon: AlignLeft, description: "Long-form text response" },
    { id: "ordering", label: "Ordering", icon: ArrowUpDown, description: "Arrange items in correct order" },
    { id: "fill-gaps", label: "Fill the Gaps", icon: Type, description: "Complete missing text" },
    { id: "text-info", label: "Text/Information", icon: FileText, description: "Informational content" },
  ]

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
    {
      id: 4,
      type: "SHORT ANSWER",
      points: 1,
      question: "Antwoord met 1 woord: Wat is de hoofdstad van Frankrijk?",
    },
    {
      id: 5,
      type: "ESSAY",
      points: 1,
      question: "Leg uit: Wat is Liefde?",
    },
    {
      id: 6,
      type: "ORDERING",
      points: 1,
      question: "Order van klein naar groot:",
      items: ["1. 5", "2. 1", "3. 6", "4. 4"],
    },
    {
      id: 7,
      type: "FILL GAPS",
      points: 1,
      question: "Vul aan",
      content: "May the [force] be with you!",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Worksheet Editor</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Worksheet Settings */}
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
              </CardContent>
            </Card>

            {/* Add New Task */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-type">Task Type:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-information">Text/Information</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="single-choice">Single Choice</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="ordering">Ordering</SelectItem>
                        <SelectItem value="fill-gaps">Fill the Gaps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">Content:</Label>
                    <Textarea id="content" placeholder="Enter content/instructions..." rows={4} />
                  </div>

                  <div>
                    <Label htmlFor="max-score">Max Score:</Label>
                    <Input id="max-score" type="number" defaultValue="1" className="w-20" />
                  </div>

                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

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

                          {element.items && (
                            <div className="space-y-1">
                              {element.items.map((item, itemIndex) => (
                                <p key={itemIndex} className="text-sm text-gray-600">
                                  {item}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Worksheet
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </CardContent>
            </Card>

            {/* Task Types */}
            <Card>
              <CardHeader>
                <CardTitle>Available Task Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {taskTypes.map((taskType) => {
                    const Icon = taskType.icon
                    return (
                      <div
                        key={taskType.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{taskType.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{taskType.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Worksheet Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Worksheet Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Elements:</span>
                    <span className="font-medium">{worksheetElements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Points:</span>
                    <span className="font-medium">{worksheetElements.reduce((sum, el) => sum + el.points, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estimated Time:</span>
                    <span className="font-medium">15-20 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
