"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { PlantynSidebar } from "@/components/ui/design/plantyn-sidebar"
import {
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Play,
  User,
  Calendar,
  Search,
  Award,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const [joinCode, setJoinCode] = useState("")

  const assignedWorksheets = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      teacher: "Mr. Johnson",
      dueDate: "2024-01-15",
      status: "Niet ingediend",
      statusColor: "destructive",
      estimatedTime: "15-20 min",
      attempts: 0,
      maxAttempts: 3,
      description: "Los de wiskundeproblemen op",
      priority: "high",
    },
    {
      id: 2,
      title: "Nederlandse Grammatica",
      subject: "Werkwoorden",
      teacher: "Ms. Smith",
      dueDate: "2024-01-18",
      status: "Bezig",
      statusColor: "secondary",
      estimatedTime: "25-30 min",
      attempts: 1,
      maxAttempts: 2,
      description: "Oefening met werkwoorden",
      priority: "medium",
    },
  ]

  const completedWorksheets = [
    {
      id: 3,
      title: "Geschiedenis Quiz",
      subject: "Wereldoorlog II",
      teacher: "Dr. Brown",
      completedDate: "2024-01-08",
      score: 92,
      maxScore: 100,
      feedback: "Uitstekend! Je hebt een goede kennis van de historische feiten.",
      grade: "A",
    },
    {
      id: 4,
      title: "Biologie Test",
      subject: "Cellen",
      teacher: "Prof. Wilson",
      completedDate: "2024-01-05",
      score: 78,
      maxScore: 100,
      feedback: "Goed werk, maar bestudeer de celstructuren nog eens.",
      grade: "B+",
    },
  ]

  const handleJoinWorksheet = () => {
    if (joinCode.trim()) {
      console.log("Joining worksheet with code:", joinCode)
      setJoinCode("")
    }
  }

  const averageScore =
    completedWorksheets.reduce((sum, w) => sum + (w.score / w.maxScore) * 100, 0) / completedWorksheets.length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <PlantynSidebar userType="student" userName="Student" userRole="Leerling" />

      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welkom terug, Ozkan</h1>
              <p className="text-gray-600">Hier zijn je werkbladen en voortgang</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Zoeken
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Te Doen</p>
                    <p className="text-3xl font-bold text-orange-600">{assignedWorksheets.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Voltooid</p>
                    <p className="text-3xl font-bold text-green-600">{completedWorksheets.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gemiddelde Score</p>
                    <p className="text-3xl font-bold text-teal-700">{Math.round(averageScore)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Studietijd</p>
                    <p className="text-3xl font-bold text-blue-600">2.5h</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Join Worksheet */}
          <Card className="plantyn-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Deelnemen aan Werkblad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Voer werkblad code in (bijv. ABC123)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="h-12 plantyn-input"
                  />
                </div>
                <Button onClick={handleJoinWorksheet} className="h-12 plantyn-primary">
                  Deelnemen
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Vraag je leraar om de werkblad code om deel te nemen aan een nieuw werkblad.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assigned Worksheets */}
            <Card className="plantyn-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Te Doen Werkbladen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedWorksheets.length > 0 ? (
                  <div className="space-y-4">
                    {assignedWorksheets.map((worksheet) => (
                      <div
                        key={worksheet.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                          worksheet.priority === "high" ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{worksheet.title}</h3>
                              <Badge variant={worksheet.statusColor as any}>{worksheet.status}</Badge>
                              {worksheet.priority === "high" && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{worksheet.subject}</p>
                            <p className="text-xs text-gray-500 mb-3">{worksheet.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{worksheet.teacher}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Deadline: {worksheet.dueDate}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{worksheet.estimatedTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>
                                  {worksheet.attempts}/{worksheet.maxAttempts} pogingen
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Link href={`/student-worksheet/${worksheet.id}`}>
                          <Button className="w-full plantyn-primary">
                            <Play className="w-4 h-4 mr-2" />
                            {worksheet.status === "Bezig" ? "Verder gaan" : "Beginnen"}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Geen werkbladen</h3>
                    <p className="text-gray-600">Je hebt momenteel geen werkbladen om te maken.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Worksheets */}
            <Card className="plantyn-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Voltooide Werkbladen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedWorksheets.map((worksheet) => (
                    <div key={worksheet.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{worksheet.title}</h3>
                            <Badge variant="default">Voltooid</Badge>
                            <Badge variant="outline" className="font-bold">
                              {worksheet.grade}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{worksheet.subject}</p>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{worksheet.teacher}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{worksheet.completedDate}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Score</span>
                              <span className="font-medium">
                                {worksheet.score}/{worksheet.maxScore} (
                                {Math.round((worksheet.score / worksheet.maxScore) * 100)}%)
                              </span>
                            </div>
                            <Progress value={(worksheet.score / worksheet.maxScore) * 100} className="h-2" />
                          </div>

                          {worksheet.feedback && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-900 mb-1">Feedback:</p>
                              <p className="text-xs text-blue-800">{worksheet.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link href={`/student-worksheet/${worksheet.id}/results`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Award className="w-4 h-4 mr-2" />
                          Bekijk Resultaten
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
