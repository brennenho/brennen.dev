"use client";

import { toast } from "sonner";
import { Icons } from "~/components";
import { Button } from "~/components/ui";
import { genericError } from "~/lib/errors";

interface DeleteButtonProps {
  id: string;
  onSuccess: () => Promise<void>;
}

export function DeleteButton({ id, onSuccess }: DeleteButtonProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch("/api/link/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id),
      });
      await onSuccess();

      if (!response.ok)
        toast.error("Unable to delete link. Please try again later.");
    } catch {
      genericError();
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Icons.trash className="h-4 w-4" />
    </Button>
  );
}
