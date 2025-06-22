"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlantynSidebar } from "@/components/ui/design/plantyn-sidebar";
import {
  Users,
  FolderOpen,
  FileText,
  Share2,
  Plus,
  Filter,
  Grid3X3,
  List,
  Clock,
  Search,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [viewMode, setViewMode] = useState("grid");

  const recentWorksheets = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      status: "PUBLISHED",
      instructions: "Los Op!",
      lastModified: "2 hours ago",
      submissions: 12,
      type: "worksheet",
    },
    {
      id: 2,
      title: "Nederlandse Grammatica",
      subject: "Hoofdstuk 3",
      status: "DRAFT",
      instructions: "Werkwoorden oefenen",
      lastModified: "1 day ago",
      submissions: 0,
      type: "worksheet",
    },
    {
      id: 3,
      title: "Geschiedenis Quiz",
      subject: "Wereldoorlog II",
      status: "PUBLISHED",
      instructions: "Kennis testen",
      lastModified: "3 days ago",
      submissions: 8,
      type: "worksheet",
    },
  ];

  const folders = [
    { id: 1, name: "wiskunde_folder", worksheets: 5 },
    { id: 2, name: "nederlands_folder", worksheets: 3 },
    { id: 3, name: "geschiedenis_folder", worksheets: 7 },
  ];

  const groups = [
    { id: 1, name: "wiskunde", code: "LZJKNS", members: 24 },
    { id: 2, name: "nederlands_4a", code: "MK8PQR", members: 18 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <PlantynSidebar userType="teacher" />

      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welkom terug, Ozkan</h1>
              <p className="text-gray-600">Hier is een overzicht van je werkbladen en klassen</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="plantyn-input">
                <Search className="w-4 h-4 mr-2" />
                Zoeken
              </Button>
              <Button className="plantyn-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Nieuw werkblad
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Werkbladen</p>
                    <p className="text-3xl font-bold text-gray-900">{recentWorksheets.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mappen</p>
                    <p className="text-3xl font-bold text-gray-900">{folders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Klassen</p>
                    <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="plantyn-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inzendingen</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {recentWorksheets.reduce((sum, w) => sum + w.submissions, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Snel naar section */}
          <Card className="plantyn-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Snel naar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/worksheets">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-teal-50 hover:border-teal-300"
                  >
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-700" />
                    </div>
                    <span className="text-sm font-medium">Werkbladen</span>
                  </Button>
                </Link>
                <Link href="/folders">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-orange-50 hover:border-orange-300"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">Boekenplank</span>
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Leerkrachtmateriaal</span>
                  </Button>
                </Link>
                <Link href="/shared-worksheets">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 w-full hover:bg-green-50 hover:border-green-300"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Zelf je les samenstellen</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Worksheets */}
          <Card className="plantyn-card mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Werkbladen</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="flex border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentWorksheets.map((worksheet) => (
                    <Card key={worksheet.id} className="plantyn-card hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{worksheet.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{worksheet.subject}</p>
                            <p className="text-xs text-gray-500">{worksheet.instructions}</p>
                          </div>
                          <Badge variant={worksheet.status === "PUBLISHED" ? "default" : "secondary"} className="ml-2">
                            {worksheet.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{worksheet.lastModified}</span>
                          </div>
                          <span>{worksheet.submissions} inzendingen</span>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Link href={`/worksheets/${worksheet.id}/preview`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                              Bekijken
                            </Button>
                          </Link>
                          <Link href={`/worksheets/${worksheet.id}/edit`} className="flex-1">
                            <Button size="sm" className="w-full plantyn-primary">
                              Bewerken
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWorksheets.map((worksheet) => (
                    <div
                      key={worksheet.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{worksheet.title}</h3>
                          <p className="text-sm text-gray-600">
                            {worksheet.subject} • {worksheet.instructions}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={worksheet.status === "PUBLISHED" ? "default" : "secondary"}>
                          {worksheet.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{worksheet.submissions} inzendingen</span>
                        <span className="text-sm text-gray-500">{worksheet.lastModified}</span>
                        <div className="flex space-x-2">
                          <Link href={`/worksheets/${worksheet.id}/preview`}>
                            <Button size="sm" variant="outline">
                              Bekijken
                            </Button>
                          </Link>
                          <Link href={`/worksheets/${worksheet.id}/edit`}>
                            <Button size="sm" className="plantyn-primary">
                              Bewerken
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Section */}
          <Card className="plantyn-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nieuws</p>
                    <p className="text-sm text-gray-600">Laatste updates en aankondigingen</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hulp & contact</p>
                    <p className="text-sm text-gray-600">Ondersteuning en veelgestelde vragen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
