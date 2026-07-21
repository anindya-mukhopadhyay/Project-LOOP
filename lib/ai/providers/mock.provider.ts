import type { AIProvider } from "../ai-provider.interface";
import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";

export class MockProvider implements AIProvider {
  get name(): AiProviderType {
    return "mock";
  }

  async classify(text: string, _systemPrompt: string): Promise<NormalizedAiResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    // Basic heuristic simulation for the mock
    const lowerText = text.toLowerCase();
    
    let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
    let emotion = "Neutral";
    let urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let intent = "Feedback";
    let theme = "General";
    
    if (lowerText.includes("love") || lowerText.includes("great") || lowerText.includes("awesome")) {
      sentiment = "POSITIVE";
      emotion = "Happy";
      intent = "Praise";
      theme = "User Experience";
    } else if (lowerText.includes("hate") || lowerText.includes("broken") || lowerText.includes("terrible")) {
      sentiment = "NEGATIVE";
      emotion = "Frustrated";
      urgency = "HIGH";
      intent = "Complaint";
      theme = "Bugs";
    }

    if (lowerText.includes("crash") || lowerText.includes("down")) {
      urgency = "CRITICAL";
      intent = "Bug Report";
      theme = "Stability";
    }

    if (lowerText.includes("please add") || lowerText.includes("would be nice")) {
      intent = "Feature Request";
      theme = "Feature";
    }

    return {
      sentiment,
      emotion,
      urgency,
      intent,
      theme,
      featureArea: "Dashboard",
      language: "en",
      confidence: 0.85 + (Math.random() * 0.14), // 0.85 - 0.99
      reasoning: "Mock simulated reasoning based on keyword heuristics.",
      supportingEvidence: ["This is a mock evidence quote."],
      provider: this.name,
      model: "mock-v1",
      promptVersion: "v1", // Overridden by AIService
      classificationVersion: "1.0.0", // Overridden by AIService
      latency: 850,
      tokens: text.length / 4,
      estimatedCost: 0.0001,
      generatedAt: new Date().toISOString(),
    };
  }
}
