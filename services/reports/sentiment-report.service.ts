
export class SentimentReportService {
  async generate(): Promise<Record<string, unknown>> {
    return {
      overall: {
        positive: 65,
        neutral: 20,
        negative: 15,
      },
      channels: {
        APP_STORE: { positive: 80, neutral: 10, negative: 10 },
        SUPPORT: { positive: 30, neutral: 20, negative: 50 }
      },
      trend: "positive"
    };
  }
}
