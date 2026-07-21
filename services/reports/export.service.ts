import type { StructuredReport, ExportFormat } from '../../schemas/report.schema';

export class ExportService {
  async exportReport(report: StructuredReport, format: ExportFormat): Promise<string> {
    switch (format) {
      case 'JSON':
        return JSON.stringify(report, null, 2);
      
      case 'MARKDOWN':
        return this.generateMarkdown(report);
        
      case 'HTML':
      case 'PDF':
        // As architectural decision, PDF uses the HTML output adapter
        return this.generateHtml(report);
        
      case 'CSV':
      default:
        throw new Error(`Export format ${format} not supported yet.`);
    }
  }

  private generateMarkdown(report: StructuredReport): string {
    let md = `# ${report.title}\n\n`;
    if (report.description) md += `*${report.description}*\n\n`;
    
    for (const section of report.sections) {
      md += `## ${section.title}\n\n`;
      md += '```json\n' + JSON.stringify(section.content, null, 2) + '\n```\n\n';
    }
    
    return md;
  }

  private generateHtml(report: StructuredReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1 { color: #111827; }
          h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
          pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        <p><em>${report.description || ''}</em></p>
        ${report.sections.map(s => `
          <h2>${s.title}</h2>
          <pre>${JSON.stringify(s.content, null, 2)}</pre>
        `).join('')}
      </body>
      </html>
    `;
  }
}
