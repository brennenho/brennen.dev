import { toast } from "sonner";

export function genericError() {
  toast.error("An unexpected error occurred. Please try again later.");
}
