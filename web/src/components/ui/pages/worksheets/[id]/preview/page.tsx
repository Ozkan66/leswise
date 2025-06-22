"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Share2 } from "lucide-react"
import Link from "next/link"

export default function WorksheetPreviewPage({ params }: { params: { id: string } }) {
  const worksheetData = {
    title: "Wiskunde taak",
    description: "Hoofdstuk 1",
    instructions: "Los Op!",
    elements: [
      {
        id: 1,
        type: "MULTIPLE CHOICE",
        points: 1,
        question: "Hoofdsteden in Europa?",
        options: ["A. Brussel", "B. Athene", "C. Ankara"],
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
        options: ["A. Ja", "B. Neen"],
      },
    ],
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
            <h1 className="text-xl font-bold text-gray-900">Preview: {worksheetData.title}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link href={`/worksheets/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/worksheets/${params.id}/share`}>
              <Button size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{worksheetData.title}</CardTitle>
            {worksheetData.description && <p className="text-gray-600">{worksheetData.description}</p>}
            {worksheetData.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Instructions:</p>
                <p className="text-sm text-blue-800">{worksheetData.instructions}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {worksheetData.elements.map((element, index) => (
              <div key={element.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline">
                    {index + 1}. {element.type}
                  </Badge>
                  <Badge variant="secondary">{element.points} PTS</Badge>
                </div>

                {element.question && <p className="font-medium text-gray-900 mb-3">{element.question}</p>}

                {element.content && <p className="text-gray-700 mb-3">{element.content}</p>}

                {element.options && (
                  <div className="space-y-2">
                    {element.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <input
                          type={element.type === "SINGLE CHOICE" ? "radio" : "checkbox"}
                          name={`question-${element.id}`}
                          disabled
                        />
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {element.type === "TEXT" && (
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm text-gray-500 italic">Text/Information element - no input required</p>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center pt-6">
              <Button disabled>Submit Worksheet (Preview Mode)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
