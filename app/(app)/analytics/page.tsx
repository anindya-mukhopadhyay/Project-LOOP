import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return <ModuleShell module={appModules.analytics} />;
}
