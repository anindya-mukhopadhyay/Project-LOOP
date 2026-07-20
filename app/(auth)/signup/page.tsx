import type { Metadata } from "next";

import { AuthStageCard } from "@/components/common/auth-stage-card";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <AuthStageCard
      title="Create a Project LOOP account"
      description="Signup will attach users to tenant workspaces once authentication and workspace models are introduced."
      secondaryHref="/login"
      secondaryLabel="Already have an account?"
    />
  );
}
