import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ButtonSpinner } from "../ui/button-spinner";
import { useSession } from "@/hooks/use-session";

export const ConfirmDisconnect = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSession();

  const onDisconnect = async () => {
    setIsLoading(true);
    const res = await fetch("/api/token/destroy");
    if (res.ok) await mutate();
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>Disconnect Wallet</DialogTitle>
        <DialogDescription>
          Are you sure you want to disconnect your wallet? You will have to re-enter your seed
          phrase to connect again.
        </DialogDescription>
        <DialogFooter className="sm-flex-row">
          <Button size="sm" onClick={() => setIsOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onDisconnect}
            disabled={isLoading}
            variant="destructive"
            className="w-[84px]"
          >
            {isLoading ? <ButtonSpinner /> : "Disconnect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
