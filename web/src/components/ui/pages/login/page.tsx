"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Eye, EyeOff, User, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../../contexts/AuthContext"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"teacher" | "student" | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleLogin = async () => {
    // Hier kun je eventueel Supabase authenticatie toevoegen
    // const { error } = await signIn(email, password);
    // if (error) { ...error handling... }
    if (userType === "teacher") {
      router.push("/dashboard")
    } else if (userType === "student") {
      router.push("/student-dashboard")
    }
  }

  if (!userType) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-auYCLKcFpzSXkDRgMeTt0XGYfvpTUu.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md">
          <Card className="plantyn-card shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-teal-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welkom bij LesWise</CardTitle>
              <p className="text-gray-600 mt-2">Kies je rol om door te gaan</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-16 text-left flex items-center space-x-4 hover:bg-teal-50 hover:border-teal-300"
                onClick={() => setUserType("teacher")}
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ik ben een Leerkracht</p>
                  <p className="text-sm text-gray-600">Maak en beheer werkbladen</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-16 text-left flex items-center space-x-4 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => setUserType("student")}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ik ben een Leerling</p>
                  <p className="text-sm text-gray-600">Maak opdrachten en werkbladen</p>
                </div>
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  {"Nog geen account? "}
                  <Link href="/register" className="text-teal-700 hover:text-teal-800 font-medium">
                    Maak een account aan
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-auYCLKcFpzSXkDRgMeTt0XGYfvpTUu.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        <Card className="plantyn-card shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-teal-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Inloggen</CardTitle>
            <p className="text-gray-600 mt-2">
              Login met je {userType === "teacher" ? "Leerkracht" : "Leerling"} account
            </p>
            <Button
              variant="link"
              onClick={() => setUserType(null)}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              ← Wijzig rol
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Options */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50">
                <div className="w-6 h-6 mr-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                Doorgaan met Google
              </Button>

              <Button variant="outline" className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50">
                <div className="w-6 h-6 mr-3 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                Doorgaan met Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">of</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleLogin()
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Gebruikersnaam
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Voer je gebruikersnaam in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 plantyn-input"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Wachtwoord
                  </Label>
                  <Button variant="link" className="text-sm text-teal-700 hover:text-teal-800 p-0 h-auto">
                    Wachtwoord vergeten?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Voer je wachtwoord in"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 plantyn-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Onthoud mijn gegevens
                </Label>
              </div>

              <Button type="submit" className="w-full h-12 plantyn-primary font-medium">
                Inloggen
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {"Nog geen account? "}
                <Link href="/register" className="text-teal-700 hover:text-teal-800 font-medium">
                  Maak een account aan
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-xs text-white">© 2024 LesWise. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </div>
  )
}
