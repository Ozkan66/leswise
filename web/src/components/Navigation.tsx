"use client";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <nav className="flex items-center gap-5 px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-600 dark:text-gray-400">Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-5 px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Link
        href="/"
        className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-3"
        aria-label="Leswise Home"
      >
        <span aria-hidden="true">📚</span> Leswise
      </Link>

      {user ? (
        <>
          <Link
            href="/groups"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Groups
          </Link>
          <Link
            href="/folders"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Folders
          </Link>
          <Link
            href="/worksheets"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Worksheets
          </Link>
          <Link
            href="/shared-worksheets"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Shared Worksheets
          </Link>
          <Link
            href="/worksheet-submission"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Submissions
          </Link>
          <Link
            href="/student-submissions"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Mijn Werkbladen
          </Link>
          <Link
            href="/teacher-submissions"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Teacher Submissions
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/profile"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Welkom, {user.user_metadata?.first_name || user.email}
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/register"
            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Registreren
          </Link>
        </div>
      )}
    </nav>
  );
}