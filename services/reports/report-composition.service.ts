import type { 
  ReportSection, 
  StructuredReport, 
  ReportMetadata, 
  ReportTemplate 
} from '../../schemas/report.schema';
import { ExecutiveSummaryService } from './executive-summary.service';
import { ThemeReportService } from './theme-report.service';
import { SentimentReportService } from './sentiment-report.service';
import { BusinessImpactService } from './business-impact.service';
import { RecommendationService } from './recommendation.service';
import { ReportHealthService } from './report-health.service';

export class ReportCompositionService {
  constructor(
    private executiveSummaryService: ExecutiveSummaryService,
    private themeReportService: ThemeReportService,
    private sentimentReportService: SentimentReportService,
    private businessImpactService: BusinessImpactService,
    private recommendationService: RecommendationService,
    private reportHealthService: ReportHealthService
  ) {}

  async compose(
    template: ReportTemplate,
    _workspaceId: string,
    _metadata: ReportMetadata
  ): Promise<StructuredReport> {
    const sections: ReportSection[] = [];

    // The Pipeline: Assemble sections in the order defined by the template
    for (const sectionType of template.sections) {
      let content: unknown = null;
      const title = sectionType.replace(/_/g, ' ');

      switch (sectionType) {
        case 'EXECUTIVE_SUMMARY':
          content = await this.executiveSummaryService.generate();
          break;
        case 'BUSINESS_IMPACT':
          content = await this.businessImpactService.generate();
          break;
        case 'THEME_INTELLIGENCE':
          content = await this.themeReportService.generate();
          break;
        case 'CUSTOMER_SENTIMENT':
          content = await this.sentimentReportService.generate();
          break;
        case 'RECOMMENDATIONS':
          content = await this.recommendationService.generate();
          break;
        case 'SUPPORTING_EVIDENCE':
          // Handled within sections or by a dedicated Ask LOOP service
          content = { evidence: [] };
          break;
        case 'APPENDIX':
          content = { notes: [] };
          break;
        case 'KEY_METRICS':
        default:
          content = { data: {} };
      }

      sections.push({
        id: crypto.randomUUID(),
        type: sectionType as ReportSection['type'],
        title,
        content,
      });
    }

    const report: StructuredReport = {
      title: template.name,
      description: template.description,
      sections,
      metadata: _metadata,
    };

    report.health = await this.reportHealthService.calculateHealth(report);

    return report;
  }
}
