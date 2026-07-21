import type { Metadata } from "next";

import { AskLoopDashboard } from "@/components/ask/ask-loop-dashboard";

export const metadata: Metadata = {
  title: "Ask LOOP",
};

export default function AskPage() {
  return (
    <div className="h-full">
      <AskLoopDashboard />
    </div>
  );
}
