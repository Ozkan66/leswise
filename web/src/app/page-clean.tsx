"use client"

import { useState } from "react"
import { 
  FileText, 
  FolderOpen, 
  Users, 
  Share2,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Clock
} from "lucide-react"

export default function TeacherHomepage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Sample data based on the screenshot
  const stats = [
    { label: "Werkbladen", value: "3", icon: FileText, color: "bg-teal-50 text-teal-600", iconBg: "bg-teal-100" },
    { label: "Mappen", value: "3", icon: FolderOpen, color: "bg-orange-50 text-orange-600", iconBg: "bg-orange-100" },
    { label: "Klassen", value: "2", icon: Users, color: "bg-blue-50 text-blue-600", iconBg: "bg-blue-100" },
    { label: "Inzendingen", value: "20", icon: Share2, color: "bg-green-50 text-green-600", iconBg: "bg-green-100" }
  ]

  const quickActions = [
    { label: "Werkbladen", icon: FileText, color: "hover:bg-teal-50 hover:border-teal-200", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
    { label: "Boekenplank", icon: FolderOpen, color: "hover:bg-orange-50 hover:border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { label: "Leerkrachtmateriaal", icon: Users, color: "hover:bg-blue-50 hover:border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Zelf je les samenstellen", icon: Plus, color: "hover:bg-purple-50 hover:border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-600" }
  ]

  const worksheets = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      description: "Los Op!",
      status: "PUBLISHED",
      lastModified: "2 hours ago",
      submissions: 12
    },
    {
      id: 2,
      title: "Nederlandse Grammatica", 
      subject: "Hoofdstuk 3",
      description: "Werkwoorden oefenen",
      status: "DRAFT",
      lastModified: "1 day ago",
      submissions: 0
    },
    {
      id: 3,
      title: "Geschiedenis Quiz",
      subject: "Wereldoorlog II", 
      description: "Kennis testen",
      status: "PUBLISHED",
      lastModified: "3 days ago",
      submissions: 8
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-700 text-white z-40">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
            <div>
              <h3 className="font-semibold text-sm">Welkom! Ozkan Yilmaz</h3>
              <p className="text-xs text-slate-300">Plantyn Salesforce NL Institute SE</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-slate-600 rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4" />
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <span>Mijn klassen</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <FolderOpen className="w-4 h-4" />
            <span>Boekenplank beheren</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <FileText className="w-4 h-4" />
            <span>Mijn werkbladen</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <Share2 className="w-4 h-4" />
            <span>Gedeelde werkbladen</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <FileText className="w-4 h-4" />
            <span>Inzendingen</span>
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-600 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <Users className="w-4 h-4" />
            <span>Mijn profiel</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <FileText className="w-4 h-4" />
            <span>Help</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 rounded-lg text-sm">
            <Share2 className="w-4 h-4" />
            <span>Uitloggen</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welkom terug, Ozkan</h1>
              <p className="text-gray-600 mt-1">Hier is een overzicht van je werkbladen en klassen</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Zoeken</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Nieuw werkblad</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.split(' ')[1]}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Snel naar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl transition-all duration-200 ${action.color}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.iconBg}`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Werkbladen Section */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Werkbladen</h2>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Filters</span>
                  </button>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {worksheets.map((worksheet) => (
                    <div key={worksheet.id} className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{worksheet.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{worksheet.subject}</p>
                          <p className="text-sm text-gray-500">{worksheet.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          worksheet.status === 'PUBLISHED' 
                            ? 'bg-teal-100 text-teal-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {worksheet.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{worksheet.lastModified}</span>
                        </div>
                        <span>{worksheet.submissions} inzendingen</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-sm">
                          Bekijken
                        </button>
                        <button className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                          Bewerken
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {worksheets.map((worksheet) => (
                    <div key={worksheet.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{worksheet.title}</h3>
                          <p className="text-sm text-gray-600">{worksheet.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          worksheet.status === 'PUBLISHED' 
                            ? 'bg-teal-100 text-teal-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {worksheet.status}
                        </span>
                        <span className="text-sm text-gray-600">{worksheet.submissions} inzendingen</span>
                        <span className="text-sm text-gray-500">{worksheet.lastModified}</span>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors text-sm">
                            Bekijken
                          </button>
                          <button className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm">
                            Bewerken
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Service Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nieuws</h3>
              <p className="text-sm text-gray-600">Laatste updates en aankondigingen</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hulp & contact</h3>
              <p className="text-sm text-gray-600">Ondersteuning en veelgestelde vragen</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
