"use client";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function UserForm({ onUserAdded }: { onUserAdded: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [insertStatus, setInsertStatus] = useState<string>("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setInsertStatus("Gebruiker toevoegen...");
        const { data, error } = await supabase.from('users').insert([{ email: newEmail }]).select();
        if (error) {
          setInsertStatus("Fout bij toevoegen: " + error.message);
        } else {
          setInsertStatus("Toegevoegd! " + JSON.stringify(data));
          setNewEmail("");
          onUserAdded();
        }
      }}
      style={{margin: '16px 0', padding: '12px', background: '#efe', borderRadius: '8px'}}
    >
      <label>
        Nieuwe gebruiker (email):
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          required
          style={{marginLeft: 8, marginRight: 8}}
        />
      </label>
      <button type="submit">Toevoegen</button>
      <div style={{marginTop: 8, color: '#070'}}>{insertStatus}</div>
    </form>
  );
}
