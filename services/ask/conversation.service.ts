import { RetrievalService } from "./retrieval.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { AnswerGenerationService } from "./answer-generation.service";
import { CitationService } from "./citation.service";
import { ConversationMemoryService } from "./conversation-memory.service";
import { IntentDetectionService } from "./intent-detection.service";
import { QueryPlanningService } from "./query-planning.service";
import { SuggestedQuestionService } from "./suggested-question.service";
import { AnswerValidationService } from "./answer-validation.service";
import { RetrievalTraceService } from "./retrieval-trace.service";
import { RAGHealthService } from "./rag-health.service";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { AskRequest, AskResponse, AnswerMetadata, RetrievalTrace } from "@/schemas/ask.schema";

export class ConversationService {
  constructor(
    private readonly retrievalService = new RetrievalService(),
    private readonly promptBuilder = new PromptBuilderService(),
    private readonly answerGenService = new AnswerGenerationService(),
    private readonly citationService = new CitationService(),
    private readonly memoryService = new ConversationMemoryService(),
    private readonly intentDetection = new IntentDetectionService(),
    private readonly queryPlanner = new QueryPlanningService(),
    private readonly suggestedQuestions = new SuggestedQuestionService(),
    private readonly answerValidator = new AnswerValidationService(),
    private readonly traceService = new RetrievalTraceService(),
    private readonly healthService = new RAGHealthService(),
    private readonly conversationRepo = new ConversationRepository()
  ) {}

  async askQuestion(
    workspaceId: string, 
    userId: string, 
    request: AskRequest
  ): Promise<AskResponse> {
    
    const startTime = Date.now();

    // 1. Resolve Conversation
    let conversationId = request.conversationId;
    if (!conversationId) {
      const title = request.question.length > 50 ? request.question.substring(0, 50) + "..." : request.question;
      const conv = await this.conversationRepo.createConversation(workspaceId, userId, title);
      conversationId = conv.id;
    }

    // 2. Save User Message
    await this.memoryService.saveUserMessage(workspaceId, conversationId, userId, request.question);

    // 3. Get History & Detect Intent & Plan Query
    const history = await this.memoryService.getFormattedHistory(conversationId, workspaceId);
    const intent = await this.intentDetection.detectIntent(request.question, workspaceId);
    const plan = await this.queryPlanner.planQuery(request.question, intent);

    // 4. Retrieve Context based on plan
    // (In a full implementation, we'd loop through plan.steps)
    const { contextString, usedDocuments } = await this.retrievalService.retrieveAndBuildContext(
      workspaceId, 
      request.question, 
      request.filters
    );

    // 5. Build Final Prompt
    const prompt = this.promptBuilder.buildAskPrompt(request.question, contextString, history);

    // 6. Generate Answer
    const { answer, confidence, reasoning } = await this.answerGenService.generateAnswer(prompt, workspaceId);

    // 7. Generate Citations
    const citations = this.citationService.buildCitations(usedDocuments, answer);

    // 8. Validate Answer
    const validationResult = this.answerValidator.validate(answer, citations, confidence);
    if (!validationResult.isValid) {
      // In production, we might trigger a retry or fallback prompt here.
      console.warn("Answer failed validation", validationResult.errors);
    }

    // 9. Generate Follow-ups
    const followUps = await this.suggestedQuestions.generateSuggestions(answer, contextString, workspaceId);

    // 10. Record Trace & Observability
    const processingTimeMs = Date.now() - startTime;
    const trace: RetrievalTrace = {
      question: request.question,
      intent,
      retrievalStrategy: plan.steps[0]?.action || "STANDARD",
      retrievedIds: usedDocuments.map(d => d.id),
      rankingScores: usedDocuments.map(d => d.score),
      compressionStatistics: { inputLength: contextString.length, compressed: true },
      finalContext: contextString,
      promptVersion: "v1.0",
      provider: "stub-provider",
      model: "stub-model",
      generationTimeMs: processingTimeMs,
    };
    
    // We mock a messageId since it hasn't been created yet for trace storage
    const traceId = `trace_${Date.now()}`;
    this.traceService.recordTrace(traceId, trace);

    this.healthService.recordMetric("ask_loop.processing_time", processingTimeMs);
    this.healthService.recordMetric("ask_loop.confidence", confidence);

    const metadata: AnswerMetadata = {
      provider: "stub-provider",
      model: "stub-model",
      promptVersion: "v1.0",
      generatedAt: new Date(),
      answerConfidence: confidence,
      retrievalConfidence: usedDocuments.length > 0 ? usedDocuments[0]?.score || 0 : 0,
      citationCount: citations.length,
      processingTimeMs,
      tokenUsage: { prompt: 1500, completion: 250, total: 1750 }
    };

    // 11. Save Assistant Message (with citations & metadata)
    const assistantMessage = await this.memoryService.saveAssistantMessage(workspaceId, conversationId, answer, citations);
    // Real implementation would also save metadata to the message

    return {
      message: {
        id: assistantMessage.id,
        conversationId,
        role: "ASSISTANT",
        content: assistantMessage.content,
        citations: citations,
        metadata: metadata,
        createdAt: assistantMessage.createdAt,
      },
      conversationId,
      suggestedFollowUps: followUps,
      confidence,
      reasoning,
      metadata,
      trace // Passed back to UI for KnowledgeSourceViewer
    };
  }

  async getConversations(workspaceId: string, userId: string) {
    return this.conversationRepo.listConversations(workspaceId, userId);
  }

  async getConversationHistory(workspaceId: string, conversationId: string) {
    return this.conversationRepo.getConversation(conversationId, workspaceId);
  }
}
