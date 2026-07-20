import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <ModuleShell module={appModules.settings} />;
}
