import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ModuleShell module={appModules.reports} />;
}
