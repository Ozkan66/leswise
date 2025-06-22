"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Users, FolderOpen, FileText, Share2, BookOpen, HelpCircle, LogOut, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  userType?: "teacher" | "student"
  userName?: string
  userRole?: string
}

export function PlantynSidebar({
  userType = "teacher",
  userName = "Ozkan Yilmaz",
  userRole = "Plantyn Salesforce NL Institute SE",
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const teacherNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/groups", label: "Mijn klassen", icon: Users },
    { href: "/folders", label: "Boekenplank beheren", icon: FolderOpen },
    { href: "/worksheets", label: "Mijn werkbladen", icon: FileText },
    { href: "/shared-worksheets", label: "Gedeelde werkbladen", icon: Share2 },
    { href: "/submissions", label: "Inzendingen", icon: BookOpen },
  ]

  const studentNavItems = [
    { href: "/student-dashboard", label: "Home", icon: Home },
    { href: "/student-submissions", label: "Mijn werkbladen", icon: FileText },
    { href: "/library", label: "Bibliotheek", icon: BookOpen },
  ]

  const navItems = userType === "teacher" ? teacherNavItems : studentNavItems

  const bottomNavItems = [
    { href: "/profile", label: "Mijn profiel", icon: User },
    { href: "/help", label: "Help", icon: HelpCircle },
    { href: "/login", label: "Uitloggen", icon: LogOut },
  ]

  return (
    <div
      className={`plantyn-sidebar h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-white">Welkom! {userName}</h2>
              <p className="text-sm text-slate-300 truncate">{userRole}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-slate-600"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-slate-600 ${
                    isActive ? "bg-slate-600" : ""
                  } ${isCollapsed ? "px-2" : "px-3"}`}
                >
                  <Icon className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-slate-600">
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-slate-600 ${isCollapsed ? "px-2" : "px-3"}`}
                >
                  <Icon className={`w-4 h-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
