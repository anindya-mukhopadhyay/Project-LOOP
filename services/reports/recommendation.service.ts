import type { Recommendation } from '../../schemas/report.schema';

export class RecommendationService {
  async generate(): Promise<Recommendation[]> {
    return [
      {
        id: crypto.randomUUID(),
        title: "Fix Authentication Flow Stability",
        description: "Investigate and resolve the timeout issues in the OAuth flow.",
        priority: "CRITICAL",
        timeHorizon: "IMMEDIATE",
        expectedImpact: "Reduce login failures by 90% and prevent enterprise churn.",
        effort: "MEDIUM",
        evidence: {
          feedbackIds: [],
          quotes: ["I keep getting timed out when trying to log in.", "Login fails 50% of the time."],
          confidence: 0.95,
          source: "Ask LOOP Intelligence"
        }
      },
      {
        id: crypto.randomUUID(),
        title: "Implement SAML SSO",
        description: "Add support for SAML-based Single Sign-On for Enterprise tiers.",
        priority: "HIGH",
        timeHorizon: "90_DAYS",
        expectedImpact: "Unlock 5 pending enterprise deals.",
        effort: "HIGH",
      }
    ];
  }
}
