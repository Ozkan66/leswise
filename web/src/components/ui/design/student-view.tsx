"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, CheckCircle, AlertCircle, Play, User, Calendar } from "lucide-react"

export default function StudentView() {
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
    },
  ]

  const completedWorksheets = [
    {
      id: 2,
      title: "Nederlandse Grammatica",
      subject: "Werkwoorden",
      teacher: "Ms. Smith",
      completedDate: "2024-01-10",
      score: 85,
      maxScore: 100,
      feedback: "Goed werk! Let op de vervoeging van onregelmatige werkwoorden.",
    },
    {
      id: 3,
      title: "Geschiedenis Quiz",
      subject: "Wereldoorlog II",
      teacher: "Dr. Brown",
      completedDate: "2024-01-08",
      score: 92,
      maxScore: 100,
      feedback: "Uitstekend! Je hebt een goede kennis van de historische feiten.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mijn Toegewezen Werkbladen</h1>
            <p className="text-gray-600">Hier zie je alle werkbladen die met jou gedeeld zijn of die je kunt maken.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welkom,</p>
            <p className="font-medium">Student</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{assignedWorksheets.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedWorksheets.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      completedWorksheets.reduce((sum, w) => sum + (w.score / w.maxScore) * 100, 0) /
                        completedWorksheets.length,
                    )}
                    %
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold text-purple-600">2.5h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Worksheets */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>Toegewezen Werkbladen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedWorksheets.length > 0 ? (
              <div className="space-y-4">
                {assignedWorksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{worksheet.title}</h3>
                          <Badge variant={worksheet.statusColor as "destructive"}>{worksheet.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{worksheet.subject}</p>
                        <p className="text-sm text-gray-500 mb-3">{worksheet.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{worksheet.teacher}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Due: {worksheet.dueDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{worksheet.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>
                              {worksheet.attempts}/{worksheet.maxAttempts} attempts
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button className="ml-4">
                        <Play className="w-4 h-4 mr-2" />
                        Werkblad maken
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Geen toegewezen werkbladen</h3>
                <p className="text-gray-600">Je hebt momenteel geen werkbladen om te maken.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Worksheets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Voltooide Werkbladen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedWorksheets.map((worksheet) => (
                <div key={worksheet.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{worksheet.title}</h3>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{worksheet.subject}</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{worksheet.teacher}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Completed: {worksheet.completedDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>
                            {worksheet.score}/{worksheet.maxScore} points
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Score</span>
                          <span>{Math.round((worksheet.score / worksheet.maxScore) * 100)}%</span>
                        </div>
                        <Progress value={(worksheet.score / worksheet.maxScore) * 100} className="h-2" />
                      </div>

                      {worksheet.feedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                          <p className="text-sm text-blue-800">{worksheet.feedback}</p>
                        </div>
                      )}
                    </div>

                    <Button variant="outline">View Results</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
