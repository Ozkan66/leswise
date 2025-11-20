import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PlusCircle, FolderPlus } from "lucide-react";
import { toast } from "sonner";

export default function FolderCreateForm({ onFolderCreated }: { onFolderCreated?: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Map naam mag niet leeg zijn");
      return;
    }

    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error("Je moet ingelogd zijn");
      setLoading(false);
      return;
    }

    const { error: folderError } = await supabase
      .from("folders")
      .insert([{ name: name.trim(), owner_id: user.id }]);

    if (folderError) {
      toast.error(folderError.message || "Kon map niet aanmaken");
      setLoading(false);
      return;
    }

    toast.success("Map aangemaakt!");
    setName("");
    setLoading(false);
    if (onFolderCreated) onFolderCreated();
  };

  return (
    <Card className="bg-card/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nieuwe map naam..."
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !name.trim()} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {loading ? "Bezig..." : "Maak Map"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
