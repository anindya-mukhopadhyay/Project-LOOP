import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return <ModuleShell module={appModules.notifications} />;
}
