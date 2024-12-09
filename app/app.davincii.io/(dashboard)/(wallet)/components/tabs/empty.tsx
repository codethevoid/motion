import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

export const EmptyState = ({ label, icon }: { label: string; icon: ReactNode }) => {
  return (
    <Card className="flex h-40 items-center justify-center">
      <div className="space-y-3">
        <div className="mx-auto w-fit">{icon}</div>
        <p className="text-center text-sm">{label}</p>
      </div>
    </Card>
  );
};
