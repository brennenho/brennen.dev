export function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-md dark:shadow-slate-700 md:p-6">
      {children}
    </div>
  );
}
