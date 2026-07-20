import type { Metadata } from "next";

import { AuthStageCard } from "@/components/common/auth-stage-card";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <AuthStageCard
      title="Verify your email"
      description="Email verification will be connected when the account lifecycle and notification delivery modules are added."
      secondaryHref="/login"
      secondaryLabel="Return to log in"
    />
  );
}
