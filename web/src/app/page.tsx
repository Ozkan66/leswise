"use client";
import Image from "next/image";
import styles from "./page.module.css";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";

export default function Home() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Bezig met testen...");
  const [users, setUsers] = useState<any[]>([]);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        setSupabaseStatus("Fout: " + error.message);
        setUsers([]);
      } else {
        setSupabaseStatus("Succesvolle verbinding! Voorbeelddata: " + JSON.stringify(data?.slice(0, 1)));
        setUsers(data || []);
      }
    } catch (e: any) {
      setSupabaseStatus("Fout: " + e.message);
      setUsers([]);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div style={{margin: '16px 0', padding: '12px', background: '#eef', borderRadius: '8px'}}>
          <strong>Supabase test:</strong> {supabaseStatus}
        </div>

        <UserForm onUserAdded={fetchUsers} />
        <UserList users={users} />

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
