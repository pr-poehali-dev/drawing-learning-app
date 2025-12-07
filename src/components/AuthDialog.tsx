import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { createUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      await createUser(username, email);
      toast({ title: "Добро пожаловать! 🎨", description: "Ваш профиль создан" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось создать профиль", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Добро пожаловать в ArtLearn!</DialogTitle>
          <DialogDescription>
            Создайте профиль, чтобы отслеживать прогресс и делиться работами
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ваше имя"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader" size={18} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Создать профиль
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
