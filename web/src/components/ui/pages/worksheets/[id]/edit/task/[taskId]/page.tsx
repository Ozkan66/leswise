"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function TaskEditPage({ params }: { params: { id: string; taskId: string } }) {
  const [taskQuestion, setTaskQuestion] = useState("Hoofdsteden in Europa?")
  const [taskPoints, setTaskPoints] = useState("1")
  const [options, setOptions] = useState([
    { id: 1, text: "Brussel", correct: true },
    { id: 2, text: "Athene", correct: true },
    { id: 3, text: "Ankara", correct: false },
  ])

  const addOption = () => {
    const newOption = {
      id: options.length + 1,
      text: "",
      correct: false,
    }
    setOptions([...options, newOption])
  }

  const updateOption = (id: number, field: string, value: string | boolean) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)))
  }

  const removeOption = (id: number) => {
    setOptions(options.filter((opt) => opt.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/worksheets/${params.id}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Edit Task {params.taskId === "new" ? "(New)" : `#${params.taskId}`}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Task
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Multiple Choice Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Task Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Max Score:</Label>
                <Input
                  id="points"
                  type="number"
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(e.target.value)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Question */}
            <div>
              <Label htmlFor="question">Question:</Label>
              <Textarea
                id="question"
                value={taskQuestion}
                onChange={(e) => setTaskQuestion(e.target.value)}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            {/* Options */}
            <div>
              <Label>Answer Options:</Label>
              <div className="space-y-3 mt-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium w-8">{String.fromCharCode(65 + index)}.</span>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(option.id, "text", e.target.value)}
                      placeholder="Enter option text..."
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={option.correct}
                        onCheckedChange={(checked) => updateOption(option.id, "correct", checked)}
                      />
                      <Label className="text-sm">Correct</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addOption} className="mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* Task Preview */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Preview:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-3">{taskQuestion}</p>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input type="checkbox" disabled />
                      <span className="text-sm">
                        {String.fromCharCode(65 + index)}. {option.text}
                        {option.correct && <span className="text-green-600 ml-2">✓</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
