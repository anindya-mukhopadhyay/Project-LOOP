import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthStageCardProps = {
  title: string;
  description: string;
  secondaryHref: Route;
  secondaryLabel: string;
};

export function AuthStageCard({
  title,
  description,
  secondaryHref,
  secondaryLabel,
}: AuthStageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          Auth.js is configured at the platform boundary. Provider wiring, credential validation,
          email delivery, and account lifecycle flows will be implemented in the authentication
          module.
        </div>
        <Button className="w-full" disabled>
          Authentication flow pending
        </Button>
        <Button asChild variant="link" className="w-full">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
