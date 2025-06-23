'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// This is a client component because we need to use the usePathname hook

export default function WorksheetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const worksheetId = params.id;

  const navLinks = [
    // Note: Adjust these paths if your routes are different
    { name: 'Preview', href: `/worksheets/${worksheetId}/preview` },
    { name: 'Edit', href: `/worksheets/${worksheetId}/edit` },
    { name: 'Sharing', href: `/worksheets/${worksheetId}/sharing` },
  ];

  return (
    <div className="container mx-auto px-4">
      <nav className="border-b-2 border-gray-200 mb-6">
        <ul className="flex space-x-8 -mb-px">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link href={link.href} legacyBehavior>
                  <a
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {link.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
}
