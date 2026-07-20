import type { Metadata } from "next";

import { AuthStageCard } from "@/components/common/auth-stage-card";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthStageCard
      title="Recover account access"
      description="Password recovery is reserved for the authentication module, including email delivery and token validation."
      secondaryHref="/login"
      secondaryLabel="Return to log in"
    />
  );
}
