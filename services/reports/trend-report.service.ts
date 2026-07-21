
export class TrendReportService {
  async generate(): Promise<Record<string, unknown>> {
    return {
      trendLine: [
        { date: "2026-07-15", volume: 120, sentiment: 65 },
        { date: "2026-07-16", volume: 140, sentiment: 68 },
        { date: "2026-07-17", volume: 110, sentiment: 70 },
      ],
      summary: "Feedback volume is stable, while average sentiment is slowly increasing."
    };
  }
}
