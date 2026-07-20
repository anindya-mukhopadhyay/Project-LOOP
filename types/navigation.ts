import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

export type AppModuleKey =
  | "dashboard"
  | "feedback"
  | "themes"
  | "analytics"
  | "ask"
  | "reports"
  | "workspace"
  | "members"
  | "notifications"
  | "settings"
  | "profile"
  | "admin";

export type NavigationItem = {
  title: string;
  href: Route;
  icon: LucideIcon;
  description: string;
  badge?: string;
};

export type AppModule = NavigationItem & {
  key: AppModuleKey;
  status: string;
  readiness: string[];
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};
