import { RetrievalTrace } from "@/schemas/ask.schema";

export class RetrievalTraceService {
  private traces: Map<string, RetrievalTrace> = new Map();

  recordTrace(id: string, trace: RetrievalTrace): void {
    // In production, this would be logged to a fast analytics datastore (e.g. BigQuery/Redis/Datadog)
    this.traces.set(id, trace);
  }

  getTrace(id: string): RetrievalTrace | undefined {
    return this.traces.get(id);
  }
}
