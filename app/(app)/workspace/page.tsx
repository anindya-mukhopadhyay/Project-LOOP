import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Workspace",
};

export default function WorkspacePage() {
  return <ModuleShell module={appModules.workspace} />;
}
