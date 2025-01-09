import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type CardProps = React.ComponentProps<typeof Card>;

interface SectionProps extends CardProps {
  title: string;
}

export function Section({ className, title, ...props }: SectionProps) {
  return (
    <Card className={cn("w-3/5", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  );
}
