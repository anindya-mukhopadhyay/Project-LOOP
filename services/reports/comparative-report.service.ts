
export class ComparativeReportService {
  async generate(): Promise<Record<string, unknown>> {
    return {
      comparison: "Current period shows a 15% increase in positive sentiment compared to the previous period.",
      metrics: {
        currentPeriod: 1450,
        previousPeriod: 1200,
        delta: "+250",
      }
    };
  }
}
