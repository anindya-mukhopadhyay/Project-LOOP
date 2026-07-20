import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return <ModuleShell module={appModules.profile} />;
}
