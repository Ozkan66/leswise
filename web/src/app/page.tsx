"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const uspList = [
  {
    title: "Direct aan de slag",
    description: "Start eenvoudig met het maken en delen van werkbladen."
  },
  {
    title: "Voor docenten & leerlingen",
    description: "Leswise is ontworpen voor het onderwijs, met focus op gebruiksgemak."
  },
  {
    title: "Veilig & privacyvriendelijk",
    description: "Jouw data is veilig en wordt niet gedeeld met derden."
  }
];

const LandingPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900">Welkom bij Leswise</h1>
        <p className="text-lg md:text-xl text-blue-700 max-w-2xl mx-auto">
          De slimme tool voor het maken, delen en beoordelen van digitale werkbladen in het onderwijs.
        </p>
      </header>
      <section className="flex flex-col md:flex-row gap-8 mb-8 w-full max-w-4xl items-center">
        <div className="flex-1 flex flex-col gap-4">
          {uspList.map((usp) => (
            <div key={usp.title} className="bg-white rounded-lg shadow p-4 border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-1">{usp.title}</h2>
              <p className="text-blue-700">{usp.description}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/illustration-landing.png"
            alt="Leswise illustratie"
            width={320}
            height={240}
            className="rounded-lg shadow-lg border border-blue-100"
            priority
          />
        </div>
      </section>
      <div className="flex gap-6 mt-4">
        <Link href="/login" passHref legacyBehavior>
          <a className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition">Aanmelden</a>
        </Link>
        <Link href="/signup" passHref legacyBehavior>
          <a className="px-6 py-3 bg-white text-blue-700 border border-blue-700 rounded-lg font-semibold shadow hover:bg-blue-50 transition">Account aanmaken</a>
        </Link>
      </div>
    </main>
  );
};

export default LandingPage;