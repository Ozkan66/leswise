"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, FileText, Home } from "lucide-react"
import Link from "next/link"

export default function WorksheetSubmittedPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Werkblad Ingediend!</CardTitle>
            <p className="text-gray-600">Je antwoorden zijn succesvol verzonden.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Werkblad:</span>
                <span className="font-medium">Wiskunde taak</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ingediend op:</span>
                <span className="font-medium">{new Date().toLocaleDateString("nl-NL")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-orange-600">Wordt nagekeken</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Je krijgt feedback binnen 24-48 uur</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Je kunt je resultaten bekijken in je dashboard</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Link href="/student-dashboard">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Terug naar Dashboard
                </Button>
              </Link>
              <Link href={`/student-worksheet/${params.id}/results`}>
                <Button variant="outline" className="w-full">
                  Bekijk Inzending
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
