/* eslint-disable @typescript-eslint/no-unused-vars */
import { IntentType } from "@/schemas/ask.schema";

export class IntentDetectionService {
  async detectIntent(question: string, _workspaceId: string): Promise<IntentType> {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes("compare") || lowerQ.includes("versus") || lowerQ.includes("vs")) {
      return "COMPARISON";
    }
    if (lowerQ.includes("trend") || lowerQ.includes("growth") || lowerQ.includes("over time")) {
      return "TREND_ANALYSIS";
    }
    if (lowerQ.includes("theme") || lowerQ.includes("topics")) {
      return "THEME_QUERY";
    }
    if (lowerQ.includes("metric") || lowerQ.includes("how many") || lowerQ.includes("analytics")) {
      return "ANALYTICS_QUERY";
    }
    if (lowerQ.includes("recommend") || lowerQ.includes("what should we do")) {
      return "RECOMMENDATION";
    }
    if (lowerQ.includes("summarize") || lowerQ.includes("summary")) {
      return "SUMMARY";
    }
    
    // Default fallback
    return "FEEDBACK_QUERY";
  }
}
