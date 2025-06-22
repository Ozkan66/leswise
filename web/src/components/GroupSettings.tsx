import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { Group } from "../types/database";

interface GroupSettingsProps {
  groupId: string;
  onClose: () => void;
  onSave?: () => void;
}

export default function GroupSettings({ groupId, onClose, onSave }: GroupSettingsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<'klas' | 'community'>('community');

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error || !data) {
      setError("Failed to load group settings");
      setLoading(false);
      return;
    }

    setGroup(data);
    setName(data.name);
    setDescription(data.description || "");
    setType(data.type || 'community');
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const generateNewJumperCode = async () => {
    if (!window.confirm("Generate a new jumper code? The old code will no longer work.")) return;
    
    setSaving(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from("groups")
      .update({ jumper_code: newCode })
      .eq("id", groupId);

    if (error) {
      setError("Failed to generate new jumper code");
    } else {
      setSuccess("New jumper code generated successfully!");
      await fetchGroup(); // Refresh to show new code
    }
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("groups")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        type
      })
      .eq("id", groupId);

    if (error) {
      setError("Failed to save group settings");
    } else {
      setSuccess("Group settings saved successfully!");
      if (onSave) onSave();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
          Loading group settings...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: 24, 
        borderRadius: 8, 
        width: '90%', 
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Group Settings</h2>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              fontSize: 24, 
              cursor: 'pointer',
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="settings-name" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Group Name *
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="settings-type" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Group Type *
            </label>
            <select
              id="settings-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'klas' | 'community')}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="community">Community</option>
              <option value="klas">Klas</option>
            </select>
            <small style={{ color: '#666', fontSize: 12 }}>
              Note: Changing from Community to Klas will require approval for new members.
            </small>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="settings-description" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="settings-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
              placeholder="Describe your group's purpose..."
            />
          </div>

          <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Jumper Code</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>
                {group?.jumper_code}
              </span>
              <button
                type="button"
                onClick={generateNewJumperCode}
                disabled={saving}
                style={{
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 12
                }}
              >
                {saving ? 'Generating...' : 'Generate New Code'}
              </button>
            </div>
            <small style={{ color: '#666', fontSize: 12 }}>
              Share this code with people you want to join your group. Generating a new code will invalidate the old one.
            </small>
          </div>

          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: 16, 
              padding: 8, 
              backgroundColor: '#ffeaea', 
              borderRadius: 4 
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              color: 'green', 
              marginBottom: 16, 
              padding: 8, 
              backgroundColor: '#eafaf1', 
              borderRadius: 4 
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                backgroundColor: (saving || !name.trim()) ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 4,
                cursor: (saving || !name.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}