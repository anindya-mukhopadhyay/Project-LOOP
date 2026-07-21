export class PromptService {
  /**
   * Retrieves the current system prompt template for feedback classification.
   * Includes versioning so results can be tracked against prompt iterations.
   */
  getClassificationPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `You are an expert customer feedback analyst for an enterprise platform.
Your task is to classify incoming user feedback into a highly structured format.

Follow these rules:
1. Identify the Sentiment (POSITIVE, NEGATIVE, NEUTRAL).
2. Identify the core Emotion (e.g., Happy, Angry, Frustrated, Excited, Confused, Disappointed, Neutral).
3. Determine Urgency (CRITICAL, HIGH, MEDIUM, LOW).
4. Determine Intent (e.g., Bug Report, Feature Request, Question, Complaint, Praise, Billing, Support).
5. Extract the primary Theme (1-3 words max).
6. Extract the Feature Area mentioned (e.g., Dashboard, Settings, API).
7. Determine the ISO-639-1 Language Code.
8. Provide a Confidence score between 0.00 and 1.00 based on how clear the text is.
9. Provide a short 1-sentence Reasoning for your classification.
10. Extract up to 3 exact quotes as supportingEvidence if available.

Always return a valid JSON object matching the requested schema.`,
      
      v2: `[V2 Experimental] You are an expert AI... (Placeholder for future version)`
    };

    const prompt = prompts[version] || prompts["v1"] || "";
    
    return {
      prompt,
      version: prompts[version] ? version : "v1"
    };
  }
}
