import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type CardProps = React.ComponentProps<typeof Card>;

interface SectionProps extends CardProps {
  offset: string;
  mdx: React.ComponentType;
}

export function Section({
  className,
  offset,
  mdx: Content,
  ...props
}: SectionProps) {
  return (
    <Card
      className={cn(
        "ml-auto mr-auto mt-20 w-3/5 pt-4",
        offset === "left" ? "md:ml-20" : "md:mr-20",
        className,
      )}
      {...props}
    >
      <CardContent>
        <Content />
      </CardContent>
    </Card>
  );
}
