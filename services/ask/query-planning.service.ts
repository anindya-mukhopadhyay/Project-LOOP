import { IntentType, QueryPlan } from "@/schemas/ask.schema";

export class QueryPlanningService {
  async planQuery(_question: string, intent: IntentType): Promise<QueryPlan> {
    const plan: QueryPlan = { steps: [] };

    switch (intent) {
      case "COMPARISON":
        plan.steps.push({ action: "RETRIEVE_A", description: "Retrieve context for entity A" });
        plan.steps.push({ action: "RETRIEVE_B", description: "Retrieve context for entity B" });
        plan.steps.push({ action: "AGGREGATE", description: "Aggregate and format for comparison" });
        break;
      case "ANALYTICS_QUERY":
        plan.steps.push({ action: "QUERY_METRICS", description: "Fetch exact analytics counts" });
        plan.steps.push({ action: "RETRIEVE_CONTEXT", description: "Retrieve qualitative feedback supporting metrics" });
        break;
      default:
        plan.steps.push({ action: "SEMANTIC_SEARCH", description: "Perform standard semantic search" });
        plan.steps.push({ action: "GENERATE_ANSWER", description: "Generate grounded answer" });
        break;
    }

    return plan;
  }
}
