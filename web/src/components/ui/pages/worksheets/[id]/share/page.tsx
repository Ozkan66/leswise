"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Share2, Users, Globe, Lock } from "lucide-react"
import Link from "next/link"

export default function WorksheetSharePage({ params }: { params: { id: string } }) {
  const [shareType, setShareType] = useState("specific")
  const [maxAttempts, setMaxAttempts] = useState("3")
  const [timeLimit, setTimeLimit] = useState("")
  const [allowReview, setAllowReview] = useState(true)

  const shareLink = `https://leswise.app/worksheet/${params.id}`
  const joinCode = "ABC123"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/worksheets/${params.id}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Share Worksheet</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Share Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Sharing Options</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Share Type */}
            <div>
              <Label>Who can access this worksheet?</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="radio"
                    name="shareType"
                    value="specific"
                    checked={shareType === "specific"}
                    onChange={(e) => setShareType(e.target.value)}
                  />
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Only certain people</p>
                    <p className="text-sm text-gray-600">Share with specific users or groups</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="radio"
                    name="shareType"
                    value="registered"
                    checked={shareType === "registered"}
                    onChange={(e) => setShareType(e.target.value)}
                  />
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">All Leswise users</p>
                    <p className="text-sm text-gray-600">Anyone with a Leswise account can access</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="radio"
                    name="shareType"
                    value="public"
                    checked={shareType === "public"}
                    onChange={(e) => setShareType(e.target.value)}
                  />
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Anyone on the Internet</p>
                    <p className="text-sm text-gray-600">No registration required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attempts">Maximum Attempts:</Label>
                <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes):</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox checked={allowReview} onCheckedChange={setAllowReview} />
              <Label>Allow students to review answers after submission</Label>
            </div>
          </CardContent>
        </Card>

        {/* Share Links */}
        <Card>
          <CardHeader>
            <CardTitle>Share Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Direct Link:</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button variant="outline" onClick={() => copyToClipboard(shareLink)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Join Code:</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={joinCode} readOnly className="w-32" />
                <Button variant="outline" onClick={() => copyToClipboard(joinCode)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Badge variant="outline">Students can enter this code on the homepage</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specific Users/Groups */}
        {shareType === "specific" && (
          <Card>
            <CardHeader>
              <CardTitle>Share with Specific Users or Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Groups:</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <span>wiskunde (24 members)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <span>nederlands_4a (18 members)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="individual-users">Add Individual Users (email addresses):</Label>
                  <Input
                    id="individual-users"
                    placeholder="Enter email addresses separated by commas"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Settings */}
        <div className="flex justify-end space-x-2">
          <Link href={`/worksheets/${params.id}/edit`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button>Save Sharing Settings</Button>
        </div>
      </div>
    </div>
  )
}
