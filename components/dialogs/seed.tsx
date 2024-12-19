import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "../ui/copy-button";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ButtonSpinner } from "../ui/button-spinner";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const RevealSeed = ({ isOpen, setIsOpen }: Props) => {
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPasswordAndRevealSeed = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seed", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      console.log(data);
      setPrivateKey(data.privateKey);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error("Failed to reveal seed");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        setPrivateKey("");
        setPassword("");
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reveal Private Key</DialogTitle>
          <DialogDescription>
            Davincii will never ask for your private key. If someone asks for your private key, it
            is probably a scam. Verify you are sharing your private key with a trusted party.
          </DialogDescription>
        </DialogHeader>
        {privateKey && (
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium">Here is your private key</p>
            <div className="flex min-w-0 max-w-fit items-center space-x-2 rounded-lg bg-secondary px-2 py-1.5">
              <p className="min-w-0 truncate text-xs">{privateKey}</p>
              <CopyButton text={privateKey} />
            </div>
          </div>
        )}
        {!privateKey && (
          <>
            <Input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card"
              type="password"
            />
            <Button onClick={verifyPasswordAndRevealSeed} disabled={isLoading}>
              {isLoading ? <ButtonSpinner /> : "Reveal private key"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
