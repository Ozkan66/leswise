"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AssignedWorksheet {
  id: number;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  status: string;
  statusColor: string;
  estimatedTime: string;
  attempts: number;
  maxAttempts: number;
  description: string;
  priority: string;
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  // Redirect niet-ingelogde gebruikers naar login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Dummy data, vervang later door fetch uit Supabase
  const assignedWorksheets: AssignedWorksheet[] = [
    {
      id: 1,
      title: "Wiskunde taak",
      subject: "Hoofdstuk 1",
      teacher: "Mr. Johnson",
      dueDate: "2024-01-15",
      status: "Niet ingediend",
      statusColor: "destructive",
      estimatedTime: "15-20 min",
      attempts: 0,
      maxAttempts: 3,
      description: "Los de wiskundeproblemen op",
      priority: "high",
    },
    // ...meer taken
  ];

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welkom student!</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Jouw taken</h2>
        {assignedWorksheets.length === 0 ? (
          <p>Je hebt nog geen taken toegewezen gekregen.</p>
        ) : (
          <ul>
            {assignedWorksheets.map(ws => (
              <li key={ws.id} className="mb-2 p-4 bg-blue-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{ws.title}</span> <span className="text-gray-500 ml-2">({ws.subject})</span>
                  </div>
                  <span className="text-xs text-blue-700">{ws.dueDate}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">{ws.description}</div>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs">Status: <b>{ws.status}</b></span>
                  <span className="text-xs">Pogingen: {ws.attempts}/{ws.maxAttempts}</span>
                  <span className="text-xs">Tijd: {ws.estimatedTime}</span>
                </div>
                <Link href={`/student-worksheet/${ws.id}`} className="text-blue-700 hover:underline text-sm mt-2 inline-block">Bekijk taak</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Groep joinen</h2>
        <form className="flex gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder="Groepscode"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
          />
          <button type="submit" className="bg-blue-700 text-white px-4 py-1 rounded">Join</button>
        </form>
      </section>
    </main>
  );
}
