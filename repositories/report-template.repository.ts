import fs from 'fs';
import path from 'path';
import type { ReportTemplate } from '../schemas/report.schema';

export class ReportTemplateRepository {
  private templatesDir = path.join(process.cwd(), 'templates', 'reports');

  async findAll(): Promise<ReportTemplate[]> {
    if (!fs.existsSync(this.templatesDir)) {
      return [];
    }

    const files = fs.readdirSync(this.templatesDir);
    const templates: ReportTemplate[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(this.templatesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
          const template = JSON.parse(content) as ReportTemplate;
          templates.push(template);
        } catch (e) {
          console.error(`Failed to parse template ${file}`, e);
        }
      }
    }

    return templates;
  }

  async findById(id: string): Promise<ReportTemplate | null> {
    const templates = await this.findAll();
    return templates.find(t => t.id === id) || null;
  }
}
