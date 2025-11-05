"use client";
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  headerAction?: ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-2xl',      // 672px - for forms, profiles
  md: 'max-w-4xl',      // 896px - for medium content
  lg: 'max-w-6xl',      // 1152px - for lists, dashboards
  xl: 'max-w-7xl',      // 1280px - for wide layouts
  full: 'max-w-full'    // Full width
};

export default function PageLayout({
  children,
  title,
  description,
  maxWidth = 'xl',
  showHeader = true,
  headerAction
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && (title || headerAction) && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
            <div className="flex justify-between items-center">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {headerAction && (
                <div>
                  {headerAction}
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {children}
      </main>
    </div>
  );
}
