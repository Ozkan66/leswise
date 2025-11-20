"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../lib/utils";

// Helper to get user role from user_metadata or fallback
function getUserRole(user: any): string | undefined {
    return user?.user_metadata?.role || user?.role;
}

interface MenuItem {
    icon: string;
    label: string;
    href: string;
    roles?: string[]; // If undefined, visible to all authenticated users
}

const menuItems: MenuItem[] = [
    { icon: "🏠", label: "Dashboard", href: "/dashboard", roles: ["teacher"] },
    { icon: "🏠", label: "Dashboard", href: "/student-dashboard", roles: ["student"] },
    { icon: "👥", label: "Mijn Klassen", href: "/groups", roles: ["teacher"] },
    { icon: "👥", label: "Mijn Klassen", href: "/student-groups", roles: ["student"] },
    { icon: "📁", label: "Mappen", href: "/folders", roles: ["teacher"] },
    { icon: "📝", label: "Werkbladen", href: "/worksheets", roles: ["teacher"] },
    { icon: "🔗", label: "Gedeelde Werkbladen", href: "/shared-worksheets", roles: ["teacher"] },
    { icon: "📩", label: "Inzendingen", href: "/teacher-submissions", roles: ["teacher"] },
    { icon: "📋", label: "Mijn Inzendingen", href: "/student-submissions", roles: ["student"] },
];

const settingsItems: MenuItem[] = [
    { icon: "👤", label: "Profiel", href: "/profile" },
    { icon: "❓", label: "Help", href: "/help" },
];

export default function AppSidebar() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const { error } = await signOut();
        if (!error) {
            router.push('/');
        }
    };

    if (loading || !user) {
        return null;
    }

    const userRole = getUserRole(user);
    const displayName = user.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : user.email?.split('@')[0] || 'Gebruiker';

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(userRole || '')
    );

    return (
        <div className="w-64 bg-card border-r border-border fixed h-screen left-0 top-0 z-10 flex flex-col">
            {/* Logo & User Info */}
            <div className="p-6 border-b border-border">
                <Link
                    href={userRole === 'teacher' ? '/dashboard' : '/student-dashboard'}
                    className="flex items-center gap-2 mb-4 text-xl font-bold text-foreground hover:text-primary transition-colors"
                >
                    <span>📚</span>
                    <span>Leswise</span>
                </Link>
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Welkom, {displayName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {userRole === 'teacher' ? 'Docent' : 'Student'}
                    </p>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto p-3">
                <nav className="space-y-1">
                    {visibleMenuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <span className="text-lg shrink-0">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Settings & Actions */}
            <div className="border-t border-border p-3 space-y-1">
                {settingsItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Theme Toggle */}
                <div className="px-3 py-2">
                    <ThemeToggle />
                </div>

                <div className="h-px bg-border my-2" />

                {/* Logout Button */}
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
                >
                    <span className="text-lg shrink-0">🚪</span>
                    <span className="truncate">Uitloggen</span>
                </button>
            </div>
        </div>
    );
}
