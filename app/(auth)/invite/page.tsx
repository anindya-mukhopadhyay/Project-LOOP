"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2, User, KeyRound, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type InviteData = {
  email: string;
  role: string;
  userExists: boolean;
  workspace: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form states (for new users)
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setValidationError("Invitation token is missing from URL.");
      setValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/invitations/accept?token=${token}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Invitation token is invalid or expired.");
        }
        setInviteData(json.data);
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : "Failed to validate invitation.");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (inviteData && !inviteData.userExists) {
      if (!name.trim()) {
        toast.error("Full name is required.");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...(inviteData?.userExists ? {} : { name, password }),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to accept invitation.");
      }

      toast.success("Welcome! Invitation accepted successfully. Please login to your account.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Validating invitation token...</p>
      </div>
    );
  }

  if (validationError || !inviteData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg border border-border">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
              <AlertTriangle className="size-6" />
            </div>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              {validationError || "This invitation cannot be loaded."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => router.push("/login")} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Mail className="size-6" />
          </div>
          <CardTitle className="text-xl">You&apos;re Invited!</CardTitle>

          <CardDescription className="text-sm text-muted-foreground mt-1">
            Accept invitation to join the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-center">
            <h3 className="text-base font-bold text-foreground">
              {inviteData.workspace?.name || "Workspace"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Slug: <span className="font-mono">{inviteData.workspace?.slug}</span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Badge variant="secondary" className="capitalize text-xs font-semibold px-2 py-0.5">
                {inviteData.role.toLowerCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">access</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {inviteData.userExists ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Your email <span className="font-semibold text-foreground">{inviteData.email}</span> is already associated with an account.
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the button below to accept and link this workspace to your profile.
                </p>
                <Button type="submit" className="w-full gap-2 mt-2" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Joining Workspace...
                    </>
                  ) : (
                    <>
                      Accept & Continue
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <Input value={inviteData.email} disabled className="bg-muted/50 font-medium" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Choose Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="reg-pass"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 mt-4" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Accept & Create Account
                      <CheckCircle2 className="size-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
