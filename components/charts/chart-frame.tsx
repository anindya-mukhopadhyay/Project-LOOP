import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChartFrameProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ChartFrame({ title, description, children }: ChartFrameProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
