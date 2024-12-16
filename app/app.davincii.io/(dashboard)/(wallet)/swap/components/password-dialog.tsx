import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonSpinner } from "@/components/ui/button-spinner";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setMasterPassword: (password: string) => void;
};

export const PasswordDialog = ({ isOpen, setIsOpen, setMasterPassword }: Props) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPassword = async () => {
    if (!password) return;
    setIsLoading(true);
    const res = await fetch("/api/password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setIsLoading(false);
      toast.error("Invalid password");
      return;
    }

    setMasterPassword(password);
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogTitle>Enter your password</DialogTitle>
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-card"
        />
        <Button onClick={verifyPassword} disabled={isLoading}>
          {isLoading ? <ButtonSpinner /> : "Submit"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
