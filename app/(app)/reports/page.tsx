import { Metadata } from "next";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export const metadata: Metadata = {
  title: "Reports & Executive Intelligence | Project LOOP",
  description: "Voice of Customer Intelligence and automated reporting.",
};

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Executive Intelligence</h2>
      </div>
      <ReportsDashboard />
    </div>
  );
}
