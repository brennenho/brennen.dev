import { Card, CardContent } from "~/components/ui";
import { cn } from "~/lib/utils";

export function Section({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Card className={cn("h-80 w-96")}>
      <CardContent className="flex h-full w-full flex-col items-center justify-center">
        {children}
      </CardContent>
    </Card>
  );
}
