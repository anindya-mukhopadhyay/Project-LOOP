export class AiEventsService {
  /**
   * Hook fired when AI Classification is successfully completed for a feedback item.
   * Future Phase Integrations:
   * - Analytics Refresh (Phase 6 hooks)
   * - Theme Refresh (Phase 8)
   * - Embedding/RAG Refresh (Phase 9)
   * - VoC Report Refresh
   */
  async onClassificationComplete(feedbackId: string, workspaceId: string): Promise<void> {
    // Intentionally left empty as an integration stub for future phases.
    console.debug(`[AiEvents] onClassificationComplete fired for Feedback: ${feedbackId} in Workspace: ${workspaceId}`);
  }

  async onThemeRefresh(): Promise<void> {
    console.debug(`[AiEvents] onThemeRefresh hook stub`);
  }

  async onEmbeddingRefresh(): Promise<void> {
    console.debug(`[AiEvents] onEmbeddingRefresh hook stub`);
  }

  async onVocRefresh(): Promise<void> {
    console.debug(`[AiEvents] onVocRefresh hook stub`);
  }
}
