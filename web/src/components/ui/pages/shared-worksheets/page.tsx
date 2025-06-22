"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function SharedWorksheetsPage() {
  const navigationItems = [
    { id: "groups", label: "Groups", active: false },
    { id: "folders", label: "Folders", active: false },
    { id: "worksheets", label: "Worksheets", active: false },
    { id: "shared-worksheets", label: "Shared Worksheets", active: true },
    { id: "submissions", label: "Submissions", active: false },
    { id: "mijn-werkbladen", label: "Mijn Werkbladen", active: false },
    { id: "teacher-submissions", label: "Teacher Submissions", active: false },
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
            <CardTitle>Shared Worksheets Management</CardTitle>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">Failed to load sharing data</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button variant="default">Direct Shares (0)</Button>
                <Button variant="outline">Anonymous Links (0)</Button>
              </div>

              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Worksheet Shares</h3>
                <p className="text-gray-600">
                  No direct shares found. Share worksheets with specific users or groups to see them here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
