import { cn } from "~/lib/utils";

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-card-foreground shadow-md dark:shadow-slate-700 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
