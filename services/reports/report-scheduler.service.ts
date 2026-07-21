import { ReportRepository } from '../../repositories/report.repository';

export class ReportSchedulerService {
  constructor(private reportRepository: ReportRepository) {}

  async schedule(
    workspaceId: string, 
    userId: string,
    data: {
      title: string;
      description?: string | null;
      slug: string;
      filters: Record<string, unknown>;
      cron: string;
    }
  ): Promise<Record<string, unknown>> {
    // Architecture placeholder. 
    // Persists the configuration and marks as scheduled, but no background runner is implemented yet.
    
    return this.reportRepository.create({
      workspaceId,
      createdById: userId,
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      status: 'SCHEDULED',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: data.filters as any,
      metrics: {
        scheduleConfig: {
          cron: data.cron
        }
      },
    });
  }
}
