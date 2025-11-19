"use client";

import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

interface AuthenticatedLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export default function AuthenticatedLayout({
    children,
    showSidebar = true
}: AuthenticatedLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            {showSidebar && <AppSidebar />}

            {/* Main Content */}
            <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
                {children}
            </main>
        </div>
    );
}
