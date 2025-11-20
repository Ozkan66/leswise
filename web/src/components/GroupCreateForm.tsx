import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Users, School, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GroupCreateForm({ onGroupCreated }: { onGroupCreated?: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<'klas' | 'community'>('community');
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error("Je moet ingelogd zijn om een groep te maken");
      setLoading(false);
      return;
    }

    // Generate a random jumper code
    const jumper_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert([{ name, type, description: description || null, owner_id: user.id, jumper_code }])
      .select()
      .single();

    if (groupError || !group) {
      toast.error(groupError?.message || "Kon groep niet aanmaken");
      setLoading(false);
      return;
    }

    // Add user as group leader
    await supabase
      .from("group_members")
      .insert([{ group_id: group.id, user_id: user.id, role: "leader", status: "active" }]);

    toast.success("Groep succesvol aangemaakt!");
    setName("");
    setType('community');
    setDescription("");
    setLoading(false);
    if (onGroupCreated) onGroupCreated();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Nieuwe Groep
        </CardTitle>
        <CardDescription>
          Maak een nieuwe klas of community aan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Groepsnaam *</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Wiskunde 4B"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-type">Type *</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as 'klas' | 'community')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="community">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Community (Open samenwerking)</span>
                  </div>
                </SelectItem>
                <SelectItem value="klas">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>Klas (Docent-student)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Beschrijving (Optioneel)</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Waar is deze groep voor?"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aanmaken...
              </>
            ) : (
              "Groep Aanmaken"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
