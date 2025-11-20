'use client';

export default function WorksheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simplified layout - removed navigation tabs as they were redundant
  // Navigation is now handled within individual pages
  return <>{children}</>;
}
