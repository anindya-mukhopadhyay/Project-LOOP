import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <ModuleShell module={appModules.admin} />;
}
