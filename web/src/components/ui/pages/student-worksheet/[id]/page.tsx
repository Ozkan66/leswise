"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Save, Send, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StudentWorksheetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // Gebruik expliciete types voor answers:
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})

  const worksheetData = {
    id: params.id,
    title: "Wiskunde taak",
    subject: "Hoofdstuk 1",
    teacher: "Mr. Johnson",
    instructions: "Los alle vragen op. Je hebt 30 minuten de tijd.",
    totalQuestions: 5,
    timeLimit: 30,
    attempts: 1,
    maxAttempts: 3,
    questions: [
      {
        id: 1,
        type: "MULTIPLE_CHOICE",
        points: 2,
        question: "Welke van de volgende zijn hoofdsteden in Europa?",
        options: [
          { id: "a", text: "Brussel" },
          { id: "b", text: "Athene" },
          { id: "c", text: "Ankara" },
          { id: "d", text: "Madrid" },
        ],
        allowMultiple: true,
      },
      {
        id: 2,
        type: "SINGLE_CHOICE",
        points: 1,
        question: "Is de hoofdstad van Duitsland Berlijn?",
        options: [
          { id: "a", text: "Ja" },
          { id: "b", text: "Nee" },
        ],
        allowMultiple: false,
      },
      {
        id: 3,
        type: "SHORT_ANSWER",
        points: 1,
        question: "Wat is de hoofdstad van Frankrijk? (1 woord)",
        maxLength: 50,
      },
      {
        id: 4,
        type: "ESSAY",
        points: 3,
        question: "Leg uit wat liefde voor jou betekent. (minimaal 100 woorden)",
        minLength: 100,
      },
      {
        id: 5,
        type: "ORDERING",
        points: 2,
        question: "Zet de volgende getallen in volgorde van klein naar groot:",
        items: [
          { id: "1", text: "5" },
          { id: "2", text: "1" },
          { id: "3", text: "6" },
          { id: "4", text: "4" },
        ],
      },
    ],
  }

  const currentQuestionData = worksheetData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / worksheetData.totalQuestions) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = () => {
    // Save answers and redirect to results
    console.log("Submitting answers:", answers)
    router.push(`/student-worksheet/${params.id}/submitted`)
  }

  const handleSaveDraft = () => {
    console.log("Saving draft:", answers)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/student-dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{worksheetData.title}</h1>
              <p className="text-sm text-gray-600">
                {worksheetData.subject} • {worksheetData.teacher}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className={`font-medium`}>
                {formatTime(worksheetData.timeLimit * 60)}
              </span>
            </div>
            <Badge variant="outline">
              Poging {worksheetData.attempts}/{worksheetData.maxAttempts}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Voortgang</span>
            <span>
              {currentQuestion + 1} van {worksheetData.totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Instructions */}
        {currentQuestion === 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Instructies:</p>
                  <p className="text-sm text-blue-800">{worksheetData.instructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Vraag {currentQuestion + 1}</span>
                <Badge variant="secondary">{currentQuestionData.points} punten</Badge>
              </CardTitle>
              <Badge variant="outline">{currentQuestionData.type.replace("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg font-medium text-gray-900 mb-4">{currentQuestionData.question}</p>

              {/* Multiple Choice / Single Choice */}
              {(currentQuestionData.type === "MULTIPLE_CHOICE" || currentQuestionData.type === "SINGLE_CHOICE") && (
                <div className="space-y-3">
                  {currentQuestionData.options?.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type={currentQuestionData.allowMultiple ? "checkbox" : "radio"}
                        name={`question-${currentQuestionData.id}`}
                        value={option.id}
                        checked={
                          currentQuestionData.allowMultiple
                            ? (answers[currentQuestionData.id] as string[]).includes(option.id)
                            : answers[currentQuestionData.id] === option.id
                        }
                        onChange={(e) => {
                          if (currentQuestionData.allowMultiple) {
                            const current = answers[currentQuestionData.id] as string[] || []
                            const updated = e.target.checked
                              ? [...current, option.id]
                              : current.filter((id: string) => id !== option.id)
                            handleAnswerChange(currentQuestionData.id, updated)
                          } else {
                            handleAnswerChange(currentQuestionData.id, option.id)
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{option.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestionData.type === "SHORT_ANSWER" && (
                <Input
                  placeholder="Typ je antwoord hier..."
                  value={answers[currentQuestionData.id] as string || ""}
                  onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                  maxLength={currentQuestionData.maxLength}
                  className="text-lg"
                />
              )}

              {/* Essay */}
              {currentQuestionData.type === "ESSAY" && (
                <div>
                  <Textarea
                    placeholder="Schrijf je uitgebreide antwoord hier..."
                    value={answers[currentQuestionData.id] as string || ""}
                    onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                    rows={8}
                    className="text-base"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Minimaal {currentQuestionData.minLength} woorden vereist</span>
                    <span>
                      {(answers[currentQuestionData.id] as string || "").split(" ").filter((w: string) => w.length > 0).length}{" "}
                      woorden
                    </span>
                  </div>
                </div>
              )}

              {/* Ordering */}
              {currentQuestionData.type === "ORDERING" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Sleep de items om ze in de juiste volgorde te zetten:</p>
                  {currentQuestionData.items?.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleSaveDraft} disabled={!answers[currentQuestionData.id]}>
                  <Save className="w-4 h-4 mr-2" />
                  Opslaan
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Vorige
                </Button>

                {currentQuestion < worksheetData.totalQuestions - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={!answers[currentQuestionData.id]}
                  >
                    Volgende
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < worksheetData.totalQuestions}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Indienen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vraag Overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {worksheetData.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={
                    currentQuestion === index
                      ? "default"
                      : answers[worksheetData.questions[index].id]
                        ? "secondary"
                        : "outline"
                  }
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                  className="aspect-square"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
