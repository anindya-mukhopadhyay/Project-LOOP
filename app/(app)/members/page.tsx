import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Members",
};

export default function MembersPage() {
  return <ModuleShell module={appModules.members} />;
}
