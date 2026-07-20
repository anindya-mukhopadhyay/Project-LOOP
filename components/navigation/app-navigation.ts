import {
  BarChart3,
  Bell,
  Bot,
  FileText,
  Gauge,
  Inbox,
  Layers3,
  Settings,
  Shield,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";

import type { AppModule, NavigationSection } from "@/types/navigation";

export const appModules = {
  dashboard: {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
    description: "Executive overview and operating health.",
    status: "Foundation ready",
    readiness: [
      "Application shell",
      "Protected route",
      "System health surface",
      "Workspace-aware navigation",
    ],
  },
  feedback: {
    key: "feedback",
    title: "Feedback",
    href: "/feedback",
    icon: Inbox,
    description: "Centralized customer feedback inbox.",
    status: "Boundary ready",
    readiness: ["Route reserved", "API reserved", "Validation layer", "Persistence boundary"],
  },
  themes: {
    key: "themes",
    title: "Themes",
    href: "/themes",
    icon: Layers3,
    description: "AI-assisted theme clustering.",
    status: "AI boundary ready",
    readiness: ["Clustering surface", "AI provider contract", "API reserved", "Analytics handoff"],
  },
  analytics: {
    key: "analytics",
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Feedback trends and product signals.",
    status: "Visualization ready",
    readiness: ["Chart primitives", "Metrics route", "API reserved", "Report handoff"],
  },
  ask: {
    key: "ask",
    title: "Ask",
    href: "/ask",
    icon: Bot,
    description: "RAG chat over customer knowledge.",
    badge: "AI",
    status: "Chat boundary ready",
    readiness: [
      "Conversation surface",
      "RAG capability",
      "Streaming-ready API",
      "Citation boundary",
    ],
  },
  reports: {
    key: "reports",
    title: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Scheduled and executive reporting.",
    status: "Reporting ready",
    readiness: ["Report surface", "Export boundary", "API reserved", "Notification handoff"],
  },
  workspace: {
    key: "workspace",
    title: "Workspace",
    href: "/workspace",
    icon: Sparkles,
    description: "Tenant configuration and branding.",
    status: "Tenant boundary ready",
    readiness: [
      "Workspace context",
      "Tenant isolation point",
      "Protected route",
      "Settings handoff",
    ],
  },
  members: {
    key: "members",
    title: "Members",
    href: "/members",
    icon: Users,
    description: "Team and invitation management.",
    status: "Team boundary ready",
    readiness: ["RBAC primitives", "Invitation surface", "API reserved", "Audit handoff"],
  },
  notifications: {
    key: "notifications",
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "Product and workflow notifications.",
    status: "Delivery boundary ready",
    readiness: ["Toast provider", "Event surface", "Preference handoff", "Report delivery handoff"],
  },
  settings: {
    key: "settings",
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Application preferences and controls.",
    status: "Settings boundary ready",
    readiness: ["Form primitives", "Preference surface", "RBAC handoff", "Workspace handoff"],
  },
  profile: {
    key: "profile",
    title: "Profile",
    href: "/profile",
    icon: UserCircle,
    description: "Personal profile and security.",
    status: "Account boundary ready",
    readiness: ["Session surface", "Profile route", "Security handoff", "Notification handoff"],
  },
  admin: {
    key: "admin",
    title: "Admin",
    href: "/admin",
    icon: Shield,
    description: "Platform-level administration.",
    status: "Admin boundary ready",
    readiness: [
      "Protected route",
      "Permission primitives",
      "Audit surface",
      "Tenant support handoff",
    ],
  },
} satisfies Record<string, AppModule>;

export const navigationSections: NavigationSection[] = [
  {
    title: "Intelligence",
    items: [
      appModules.dashboard,
      appModules.feedback,
      appModules.themes,
      appModules.analytics,
      appModules.ask,
    ],
  },
  {
    title: "Operations",
    items: [appModules.reports, appModules.workspace, appModules.members, appModules.notifications],
  },
  {
    title: "Account",
    items: [appModules.settings, appModules.profile, appModules.admin],
  },
];

export const commandNavigationItems = navigationSections.flatMap((section) => section.items);

export const productSignals = [
  {
    label: "Feedback pipeline",
    value: "Ready for models",
  },
  {
    label: "Auth boundary",
    value: "Configured",
  },
  {
    label: "Tenant layer",
    value: "Prepared",
  },
];
