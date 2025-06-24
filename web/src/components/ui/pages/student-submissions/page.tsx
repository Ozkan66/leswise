"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StudentSubmissionsPage() {
  const navigationItems = [
    { id: "groups", label: "Groups", active: false },
    { id: "folders", label: "Folders", active: false },
    { id: "worksheets", label: "Worksheets", active: false },
    { id: "shared-worksheets", label: "Shared Worksheets", active: false },
    { id: "submissions", label: "Submissions", active: false },
    { id: "mijn-werkbladen", label: "Mijn Werkbladen", active: true },
    { id: "teacher-submissions", label: "Teacher Submissions", active: false },
  ]

  const assignedWorksheets = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      teacher: "Mr. Johnson",
      status: "Niet ingediend",
      statusColor: "destructive",
      feedback: "-",
      action: "Werkblad maken",
    },
  ]

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
        <Card>
          <CardHeader>
            <CardTitle>Mijn Toegewezen Werkbladen</CardTitle>
            <p className="text-gray-600">Hier zie je alle werkbladen die met jou gedeeld zijn of die je kunt maken.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Titel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Feedback</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actie</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedWorksheets.map((worksheet) => (
                    <tr key={worksheet.id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{worksheet.title}</p>
                          <p className="text-sm text-gray-600">{worksheet.subject}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={worksheet.statusColor as "default" | "secondary" | "destructive" | "outline"}>{worksheet.status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{worksheet.feedback}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="outline" size="sm">
                          {worksheet.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
