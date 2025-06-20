import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leswise",
  description: "Educational platform for worksheets and assignments",
};

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 32 }}>
          <Link href="/groups" style={{ marginRight: 12 }}>Groups</Link>
          <Link href="/folders" style={{ marginRight: 12 }}>Folders</Link>
          <Link href="/worksheets" style={{ marginRight: 12 }}>Worksheets</Link>
          <Link href="/worksheet-submission" style={{ marginRight: 12 }}>Submissions</Link>
          <Link href="/student-submissions" style={{ marginRight: 12 }}>My Submissions</Link>
          <Link href="/teacher-submissions">Teacher Submissions</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
