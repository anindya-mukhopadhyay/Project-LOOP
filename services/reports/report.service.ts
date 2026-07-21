import { ReportRepository } from '../../repositories/report.repository';
import { ReportCompositionService } from './report-composition.service';
import type { ReportTemplate, ReportMetadata } from '../../schemas/report.schema';
import type { Report } from '@prisma/client';

export class ReportService {
  constructor(
    private reportRepository: ReportRepository,
    private compositionService: ReportCompositionService
  ) {}

  async generateReport(
    workspaceId: string,
    userId: string,
    template: ReportTemplate,
    metadataOverrides: Partial<ReportMetadata>
  ): Promise<Report> {
    
    // 1. Initialize timeline (Requested -> Generating)
    const startTime = Date.now();
    
    let reportRecord = await this.reportRepository.create({
      workspaceId,
      createdById: userId,
      title: template.name,
      slug: `${template.id}-${Date.now()}`,
      description: template.description,
      status: 'GENERATING',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: (template.defaultFilters as any) || {},
      metrics: {
        timeline: [
          { status: 'REQUESTED', timestamp: new Date().toISOString() },
          { status: 'GENERATING', timestamp: new Date().toISOString() }
        ]
      }
    });

    try {
      const metadata: ReportMetadata = {
        generatedBy: userId,
        provider: 'openai',
        model: 'gpt-4o',
        promptVersion: 'report-pipeline-v1',
        workspaceId,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
        filters: template.defaultFilters || {},
        generationTimeMs: 0, // Will update after
        ...metadataOverrides
      };

      // 2. Compose the report via the pipeline engine
      const structuredReport = await this.compositionService.compose(template, workspaceId, metadata);
      
      const endTime = Date.now();
      structuredReport.metadata.generationTimeMs = endTime - startTime;

      // 3. Complete timeline
      const metrics = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(structuredReport as any),
        timeline: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(reportRecord.metrics as any).timeline,
          { status: 'COMPLETED', timestamp: new Date().toISOString() }
        ]
      };

      // 4. Save to DB
      reportRecord = await this.reportRepository.updateStatus(reportRecord.id, workspaceId, 'READY');
      reportRecord = await this.reportRepository.update(reportRecord.id, workspaceId, {
        metrics,
        narrative: "Report generated successfully"
      });

      // 5. Future Automation Hooks (Architecture Placeholder)
      this.emitAutomationHooks(reportRecord);

      return reportRecord;
    } catch (error) {
      console.error("Report generation failed:", error);
      
      const failedMetrics = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(reportRecord.metrics as any),
        timeline: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(reportRecord.metrics as any).timeline,
          { status: 'FAILED', timestamp: new Date().toISOString(), error: String(error) }
        ]
      };

      await this.reportRepository.update(reportRecord.id, workspaceId, {
        status: 'FAILED',
        metrics: failedMetrics,
      });

      throw error;
    }
  }

  private emitAutomationHooks(report: Report) {
    // Fire-and-forget events
    // - Email Notification
    // - Slack / Teams ping
    // - Webhook invocation
    console.log(`[Automation Hooks] Emitting generation events for report ${report.id}`);
  }
}
