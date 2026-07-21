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

  getThemeDiscoveryPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `You are an expert product analyst. Discover emerging themes from this batch of customer feedback.
Extract 3-5 high-level themes that represent recurring topics, feature requests, or bugs.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }

  getThemeClusterPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `You are an expert AI clustering engine. 
Analyze the provided themes and group them into overarching parent clusters based on semantic similarity.
Merge overlapping topics.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }

  getThemeSummaryPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `Generate a concise executive summary for this specific theme based on the associated feedback.
Highlight the core issue, frequency, and sentiment.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }

  getBusinessImpactPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `Analyze the business and customer impact of this theme. 
Identify revenue risk, retention risk, and operational impact.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }

  getAskLoopSystemPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `You are Ask LOOP, an Enterprise Knowledge Intelligence Platform.
Your responsibility is to answer the user's business question using ONLY the provided retrieved context.

RULES:
1. Ground your answer entirely in the retrieved sources (Feedback, Themes, Reports).
2. Do NOT hallucinate or fabricate information. If the answer is not in the context, say so.
3. Be concise, professional, and analytical.
4. When stating a fact or metric, mention the source implicitly.
5. Provide a summary of your reasoning and list the key insights.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }

  getAskLoopFollowUpPrompt(version: string = "v1"): { prompt: string; version: string } {
    const prompts: Record<string, string> = {
      v1: `Based on the conversation history and the answer just provided, generate 3-5 suggested follow-up questions for the user.
The questions should allow the user to drill deeper into the data or explore related insights.
Format the output as a JSON array of strings.`
    };
    return { prompt: prompts[version] || prompts["v1"]!, version: prompts[version] ? version : "v1" };
  }
}
