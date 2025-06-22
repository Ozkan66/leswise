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
        setInsertStatus("Gebruiker uitnodigen...");
        
        try {
          // For now, just simulate creating a user profile
          // In a real app, this would send an invitation email
          const { data, error } = await supabase.from('user_profiles').insert([{ 
            user_id: crypto.randomUUID(), // This would normally come from auth
            email: newEmail,
            role: 'student'
          }]).select();
          
          if (error) {
            setInsertStatus("Fout bij uitnodigen: " + error.message);
          } else {
            setInsertStatus("Uitnodiging verstuurd! " + JSON.stringify(data));
            setNewEmail("");
            onUserAdded();
          }
        } catch (err: unknown) {
          setInsertStatus("Fout: " + (err as Error).message);
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
      <button type="submit">Uitnodigen</button>
      <div style={{marginTop: 8, color: '#070'}}>{insertStatus}</div>
    </form>
  );
}
