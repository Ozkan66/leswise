import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { Group } from "../types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Settings, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface GroupSettingsProps {
  groupId: string;
  onClose: () => void;
  onSave?: () => void;
}

export default function GroupSettings({ groupId, onClose, onSave }: GroupSettingsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

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
      toast.error("Kon groepsinstellingen niet laden");
      setLoading(false);
      onClose();
      return;
    }

    setGroup(data);
    setName(data.name);
    setDescription(data.description || "");
    setType(data.type || 'community');
    setLoading(false);
  }, [groupId, onClose]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const generateNewJumperCode = async () => {
    if (!window.confirm("Nieuwe jumper code genereren? De oude code werkt dan niet meer.")) return;

    setSaving(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase
      .from("groups")
      .update({ jumper_code: newCode })
      .eq("id", groupId);

    if (error) {
      toast.error("Kon nieuwe code niet genereren");
    } else {
      toast.success("Nieuwe jumper code gegenereerd!");
      await fetchGroup(); // Refresh to show new code
    }
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("groups")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        type
      })
      .eq("id", groupId);

    if (error) {
      toast.error("Kon instellingen niet opslaan");
    } else {
      toast.success("Groepsinstellingen opgeslagen!");
      if (onSave) onSave();
      onClose();
    }
    setSaving(false);
  };

  const copyJumperCode = () => {
    if (group?.jumper_code) {
      navigator.clipboard.writeText(group.jumper_code);
      setCopied(true);
      toast.success("Code gekopieerd!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Groepsinstellingen
          </DialogTitle>
          <DialogDescription>
            Beheer de details en toegang van deze groep.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Groepsnaam *</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Bijv. Wiskunde 4B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-type">Type *</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as 'klas' | 'community')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">Community (Open)</SelectItem>
                  <SelectItem value="klas">Klas (Gesloten)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Let op: Bij wijzigen naar 'Klas' moeten nieuwe leden goedgekeurd worden.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-description">Beschrijving</Label>
              <Textarea
                id="settings-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Waar is deze groep voor?"
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Jumper Code</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={generateNewJumperCode}
                  disabled={saving}
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  Nieuwe Code
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-2 rounded border font-mono text-lg font-bold text-center tracking-widest">
                  {group?.jumper_code}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyJumperCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Deel deze code met mensen die lid willen worden.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuleren
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opslaan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}