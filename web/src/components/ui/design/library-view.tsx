"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid3X3, List, Bookmark, BookOpen, Clock, Star } from "lucide-react"
import Image from "next/image"

export default function LibraryView() {
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")

  const books = [
    {
      id: 1,
      title: "Advanced Calculus",
      subject: "Mathematics",
      author: "Dr. Smith",
      progress: 75,
      rating: 4.8,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: true,
      lastRead: "2 hours ago",
      totalPages: 320,
      currentPage: 240,
    },
    {
      id: 2,
      title: "Quantum Physics",
      subject: "Physics",
      author: "Prof. Johnson",
      progress: 45,
      rating: 4.6,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: false,
      lastRead: "1 day ago",
      totalPages: 280,
      currentPage: 126,
    },
    {
      id: 3,
      title: "World History",
      subject: "History",
      author: "Dr. Williams",
      progress: 90,
      rating: 4.9,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: true,
      lastRead: "3 days ago",
      totalPages: 450,
      currentPage: 405,
    },
    {
      id: 4,
      title: "Organic Chemistry",
      subject: "Chemistry",
      author: "Prof. Davis",
      progress: 30,
      rating: 4.5,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: false,
      lastRead: "1 week ago",
      totalPages: 380,
      currentPage: 114,
    },
    {
      id: 5,
      title: "Literature Analysis",
      subject: "English",
      author: "Dr. Brown",
      progress: 60,
      rating: 4.7,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: true,
      lastRead: "5 days ago",
      totalPages: 290,
      currentPage: 174,
    },
    {
      id: 6,
      title: "Biology Fundamentals",
      subject: "Biology",
      author: "Prof. Wilson",
      progress: 85,
      rating: 4.8,
      cover: "/placeholder.svg?height=160&width=120",
      isBookmarked: false,
      lastRead: "4 days ago",
      totalPages: 340,
      currentPage: 289,
    },
  ]

  const subjects = ["All", "Mathematics", "Physics", "Chemistry", "History", "English", "Biology"]
  const [selectedSubject, setSelectedSubject] = useState("All")

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "All" || book.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
              <p className="text-gray-600 mt-1">Manage and access your learning materials</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <div className="flex border border-gray-300 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className="whitespace-nowrap"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Image
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      width={120}
                      height={160}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                      <Bookmark
                        className={`w-4 h-4 ${book.isBookmarked ? "fill-blue-600 text-blue-600" : "text-gray-600"}`}
                      />
                    </Button>
                    <Badge className="absolute bottom-2 left-2 bg-white text-gray-700">{book.progress}%</Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{book.subject}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating}</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{book.lastRead}</span>
                      </div>
                      <span>
                        {book.currentPage}/{book.totalPages} pages
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      width={64}
                      height={80}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{book.subject}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{book.rating}</span>
                            </div>
                            <span>
                              {book.currentPage}/{book.totalPages} pages
                            </span>
                            <span>{book.lastRead}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{book.progress}%</Badge>
                          <Button variant="ghost" size="icon">
                            <Bookmark
                              className={`w-4 h-4 ${book.isBookmarked ? "fill-blue-600 text-blue-600" : "text-gray-600"}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
