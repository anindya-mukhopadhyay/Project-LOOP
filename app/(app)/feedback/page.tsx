import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Feedback",
};

export default function FeedbackPage() {
  return <ModuleShell module={appModules.feedback} />;
}
