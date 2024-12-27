"use client";

import { useWalletActions } from "./context";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ButtonSpinner } from "../ui/button-spinner";

export const Password = () => {
  const { password, setPassword } = useWalletActions();
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPassword = async () => {
    if (!currentPassword) return;
    setIsLoading(true);
    const res = await fetch("/api/password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: currentPassword }),
    });

    if (!res.ok) {
      setIsLoading(false);
      toast.error("Invalid password");
      return;
    }

    setPassword(currentPassword);
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <Input
        type="password"
        placeholder="Enter your password"
        className="bg-card"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Button onClick={verifyPassword} className="w-full" disabled={isLoading}>
        {isLoading ? <ButtonSpinner /> : "Verify"}
      </Button>
    </div>
  );
};
