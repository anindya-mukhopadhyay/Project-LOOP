import type { Metadata } from "next";

import { AuthStageCard } from "@/components/common/auth-stage-card";

export const metadata: Metadata = {
  title: "Log In",
};

export default function LoginPage() {
  return (
    <AuthStageCard
      title="Log in to Project LOOP"
      description="Authentication routes and layout are configured. Provider and credential flows are intentionally deferred."
      secondaryHref="/signup"
      secondaryLabel="Create a workspace account"
    />
  );
}
