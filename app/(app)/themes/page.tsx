import type { Metadata } from "next";

import { ModuleShell } from "@/components/common/module-shell";
import { appModules } from "@/components/navigation/app-navigation";

export const metadata: Metadata = {
  title: "Themes",
};

export default function ThemesPage() {
  return <ModuleShell module={appModules.themes} />;
}
