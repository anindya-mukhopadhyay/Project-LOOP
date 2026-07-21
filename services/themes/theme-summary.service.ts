import { ThemeRepository } from "@/repositories/theme.repository";
import { PromptService } from "@/services/ai/prompt.service";

export class ThemeSummaryService {
  constructor(
    private readonly themeRepo: ThemeRepository = new ThemeRepository(),
    private readonly promptService: PromptService = new PromptService()
  ) {}

  async generateSummary(themeId: string, workspaceId: string): Promise<void> {
    // In a real implementation we would fetch representative feedback to pass to AI
    // For Phase 8 architecture we stub the provider response
    
    const { prompt: summaryPrompt, version: summaryVersion } = this.promptService.getThemeSummaryPrompt();
    const { prompt: impactPrompt, version: impactVersion } = this.promptService.getBusinessImpactPrompt();
    
    console.log(summaryPrompt, impactPrompt);

    // Stubbing the AI call
    const executiveSummary = "This theme relates to frequent user complaints regarding billing failures during checkout.";
    const businessImpact = "High revenue risk. 15% of support volume.";
    const customerImpact = "High friction. Prevents users from completing purchases.";
    const keywords = ["billing", "checkout", "error 500", "payment failed"];
    const quotes = ["I tried to pay but got an error.", "My card was declined incorrectly."];

    await this.themeRepo.updateMetadata(themeId, workspaceId, (metadata) => {
      metadata.ai.executiveSummary = executiveSummary;
      metadata.ai.businessImpact = businessImpact;
      metadata.ai.customerImpact = customerImpact;
      metadata.ai.keywords = keywords;
      metadata.ai.representativeQuotes = quotes;
      
      metadata.ai.promptVersion = `${summaryVersion}, ${impactVersion}`;
      metadata.ai.generatedAt = new Date().toISOString();
      metadata.ai.confidence = 0.92;

      return metadata;
    });
  }
}
