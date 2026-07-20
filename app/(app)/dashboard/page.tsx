import type { Metadata } from "next";

import { FoundationOverview } from "@/components/dashboard/foundation-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <FoundationOverview />;
}
