"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your registered email address";
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [isVerified, setIsVerified] = React.useState(false);

  React.useEffect(() => {
    // Simulate email verification token check
    const token = searchParams.get("token");
    const timer = setTimeout(() => {
      setIsVerifying(false);
      if (token) {
        setIsVerified(true);
        toast.success("Email address verified successfully!");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleResend = () => {
    toast.success(`Verification link resent to ${email}`);
  };

  return (
    <Card className="border-border bg-card/60 backdrop-blur-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Verify email</CardTitle>
        <CardDescription>
          {isVerifying
            ? "Checking your verification details..."
            : isVerified
              ? "Your account email has been verified"
              : `Verification instructions sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Validating verification token...</p>
          </div>
        ) : isVerified ? (
          <div className="space-y-4 text-center py-2">
            <div className="flex justify-center">
              <CheckCircle2 className="size-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-6">
              Thank you! Your email is verified, and your workspace credentials are fully active.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Log In to Workspace</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
              Please click the link inside the confirmation email sent to you. If you don&apos;t see it,
              check your spam folder or trigger a new verification link below.
            </div>
            <Button onClick={handleResend} variant="outline" className="w-full">
              <Mail className="mr-2 size-4" />
              Resend Verification Email
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline hover:text-primary/90"
        >
          <ArrowLeft className="size-3" />
          Back to log in
        </Link>
      </CardFooter>
    </Card>
  );
}
