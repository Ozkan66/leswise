import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Hash, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

interface JoinGroupFormProps {
  onGroupJoined?: () => void;
}

export default function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [jumperCode, setJumperCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error("Je moet ingelogd zijn");
      setLoading(false);
      return;
    }

    try {
      // Find group by jumper code
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id, name, type")
        .eq("jumper_code", jumperCode.trim().toUpperCase())
        .single();

      if (groupError || !group) {
        toast.error("Ongeldige jumper code. Controleer de code en probeer opnieuw.");
        setLoading(false);
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("status")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        if (existingMember.status === "active") {
          toast.info("Je bent al lid van deze groep.");
        } else if (existingMember.status === "pending") {
          toast.warning("Je verzoek om lid te worden is nog in behandeling.");
        }
        setLoading(false);
        return;
      }

      // Add user as pending member for klas groups, active for community groups
      const status = group.type === "klas" ? "pending" : "active";
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: "member",
          status
        }]);

      if (memberError) {
        toast.error("Kon niet lid worden van de groep.");
        setLoading(false);
        return;
      }

      if (status === "pending") {
        toast.success(`Verzoek verstuurd! Je aanvraag voor "${group.name}" wacht op goedkeuring.`);
      } else {
        toast.success(`Succes! Je bent nu lid van "${group.name}".`);
      }

      setJumperCode("");
      if (onGroupJoined) onGroupJoined();
    } catch {
      toast.error("Er is een onverwachte fout opgetreden.");
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-primary" />
          Deelnemen aan Groep
        </CardTitle>
        <CardDescription>
          Gebruik een jumper code om lid te worden
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jumper-code">Jumper Code *</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="jumper-code"
                value={jumperCode}
                onChange={(e) => setJumperCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                required
                maxLength={6}
                className="pl-9 uppercase font-mono tracking-wider"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Jumper codes zijn 6 tekens lang (bijv. ABC123)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || jumperCode.length !== 6}
            variant="secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deelnemen...
              </>
            ) : (
              "Deelnemen"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}