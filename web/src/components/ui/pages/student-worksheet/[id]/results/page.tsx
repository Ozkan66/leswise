"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Award, Clock } from "lucide-react"
import Link from "next/link"

export default function WorksheetResultsPage({ params }: { params: { id: string } }) {
  const resultsData = {
    worksheetTitle: "Wiskunde taak",
    subject: "Hoofdstuk 1",
    teacher: "Mr. Johnson",
    submittedDate: "2024-01-10",
    gradedDate: "2024-01-11",
    totalScore: 7,
    maxScore: 9,
    percentage: 78,
    grade: "B+",
    timeSpent: "23 minuten",
    feedback: "Goed werk! Je hebt de meeste concepten goed begrepen. Let vooral op de volgorde bij vraag 5.",
    questions: [
      {
        id: 1,
        question: "Welke van de volgende zijn hoofdsteden in Europa?",
        type: "MULTIPLE_CHOICE",
        points: 2,
        scored: 2,
        correct: true,
        studentAnswer: ["Brussel", "Athene", "Madrid"],
        correctAnswer: ["Brussel", "Athene", "Madrid"],
        feedback: "Perfect! Alle hoofdsteden correct geïdentificeerd.",
      },
      {
        id: 2,
        question: "Is de hoofdstad van Duitsland Berlijn?",
        type: "SINGLE_CHOICE",
        points: 1,
        scored: 1,
        correct: true,
        studentAnswer: "Ja",
        correctAnswer: "Ja",
        feedback: "Correct!",
      },
      {
        id: 3,
        question: "Wat is de hoofdstad van Frankrijk?",
        type: "SHORT_ANSWER",
        points: 1,
        scored: 1,
        correct: true,
        studentAnswer: "Parijs",
        correctAnswer: "Parijs",
        feedback: "Juist antwoord.",
      },
      {
        id: 4,
        question: "Leg uit wat liefde voor jou betekent.",
        type: "ESSAY",
        points: 3,
        scored: 2,
        correct: "partial",
        studentAnswer:
          "Liefde is een gevoel van verbondenheid en zorg voor anderen. Het betekent dat je er voor elkaar bent.",
        feedback: "Goed begin, maar je antwoord is te kort. Probeer meer diepgang en voorbeelden te geven.",
      },
      {
        id: 5,
        question: "Zet de getallen in volgorde van klein naar groot: 5, 1, 6, 4",
        type: "ORDERING",
        points: 2,
        scored: 1,
        correct: false,
        studentAnswer: "1, 4, 6, 5",
        correctAnswer: "1, 4, 5, 6",
        feedback: "Bijna goed! Je hebt 5 en 6 omgewisseld.",
      },
    ],
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQuestionIcon = (correct: boolean | string) => {
    if (correct === true) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (correct === "partial") return <AlertCircle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/student-dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resultaten: {resultsData.worksheetTitle}</h1>
              <p className="text-sm text-gray-600">
                {resultsData.subject} • {resultsData.teacher}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Score Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Je Resultaat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(resultsData.percentage)}`}>
                  {resultsData.percentage}%
                </div>
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {resultsData.totalScore}/{resultsData.maxScore} punten
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Cijfer: {resultsData.grade}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{resultsData.percentage}%</span>
                  </div>
                  <Progress value={resultsData.percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Ingediend:</span>
                    <p className="font-medium">{resultsData.submittedDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nagekeken:</span>
                    <p className="font-medium">{resultsData.gradedDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tijd besteed:</span>
                    <p className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {resultsData.timeSpent}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            {resultsData.feedback && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Algemene Feedback:</h3>
                <p className="text-blue-800">{resultsData.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question by Question Results */}
        <Card>
          <CardHeader>
            <CardTitle>Gedetailleerde Resultaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resultsData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    {getQuestionIcon(question.correct)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">Vraag {index + 1}</h3>
                        <Badge variant="outline">{question.type.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{question.question}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      <span
                        className={
                          question.correct === true
                            ? "text-green-600"
                            : question.correct === "partial"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {question.scored}
                      </span>
                      <span className="text-gray-500">/{question.points}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Jouw Antwoord:</h4>
                    <div className="p-2 bg-gray-50 rounded border">
                      {Array.isArray(question.studentAnswer)
                        ? question.studentAnswer.join(", ")
                        : question.studentAnswer}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Correct Antwoord:</h4>
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      {Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(", ")
                        : question.correctAnswer}
                    </div>
                  </div>
                </div>

                {question.feedback && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">{question.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/student-dashboard">
            <Button variant="outline">Terug naar Dashboard</Button>
          </Link>
          <Link href={`/student-worksheet/${params.id}`}>
            <Button>Opnieuw Proberen</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
