import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Ask",
};

export default function AskPage() {
  return <ModuleShell module={appModules.ask} />;
}
