import { Channel, FeedbackStatus, Role, Prisma, type PrismaClient } from "@prisma/client";
import { FeedbackRepository } from "@/repositories/feedback.repository";
import { AuditService } from "./audit.service";
import { ServiceError, type ServiceResult } from "./errors";
import { prisma } from "@/lib/database";

export interface ImportError {
  row: number;
  column?: string;
  message: string;
  isFatal?: boolean;
}

export interface ImportPreview {
  headers: string[];
  sampleRows: string[][];
}

export interface ImportSummary {
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: ImportError[];
}

export class ImportService {
  private feedbackRepository: FeedbackRepository;
  private auditService: AuditService;

  constructor(
    feedbackRepository = new FeedbackRepository(),
    auditService = new AuditService()
  ) {
    this.feedbackRepository = feedbackRepository;
    this.auditService = auditService;
  }

  parseCSV(text: string): string[][] {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next char
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = "";
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        result.push(row);
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }

    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      result.push(row);
    }

    return result.filter((r) => r.length > 0 && r.some((val) => val !== ""));
  }

  async validateAndPrepare(
    workspaceId: string,
    csvRows: string[][],
    columnMapping: Record<string, string> // maps database_field -> csv_header_index
  ): Promise<ServiceResult<{ validRows: Prisma.FeedbackUncheckedCreateInput[]; summary: ImportSummary }>> {
    try {
      const errors: ImportError[] = [];
      const validRows: Prisma.FeedbackUncheckedCreateInput[] = [];
      let skippedCount = 0;
      let failedCount = 0;

      if (csvRows.length === 0) {
        return {
          ok: false,
          error: new ServiceError("CSV file is empty.", "BAD_REQUEST"),
        };
      }

      const headers = csvRows[0];
      if (!headers) {
        return {
          ok: false,
          error: new ServiceError("CSV file is empty or missing headers.", "BAD_REQUEST"),
        };
      }
      const dataRows = csvRows.slice(1);

      if (dataRows.length > 5000) {
        return {
          ok: false,
          error: new ServiceError("CSV imports are limited to a maximum of 5,000 rows per upload.", "BAD_REQUEST"),
        };
      }

      // Map field keys to header index
      const fieldToIdx: Record<string, number> = {};
      for (const [field, headerName] of Object.entries(columnMapping)) {
        const idx = headers.findIndex((h) => h.toLowerCase() === headerName.toLowerCase());
        if (idx !== -1) {
          fieldToIdx[field] = idx;
        }
      }

      // Ensure required mappings are present
      if (fieldToIdx.title === undefined || fieldToIdx.body === undefined || fieldToIdx.channel === undefined) {
        return {
          ok: false,
          error: new ServiceError("Required columns (title, body, channel) must be mapped.", "BAD_REQUEST"),
        };
      }

      // Extract indexes safely
      const titleIdx = fieldToIdx.title;
      const bodyIdx = fieldToIdx.body;
      const channelIdx = fieldToIdx.channel;
      const externalIdIdx = fieldToIdx.externalId;
      const customerEmailIdx = fieldToIdx.customerEmail;
      const customerNameIdx = fieldToIdx.customerName;
      const sourceUrlIdx = fieldToIdx.sourceUrl;
      const languageIdx = fieldToIdx.language;
      const priorityIdx = fieldToIdx.priority;

      // Track duplicates inside the file
      const fileDuplicates = new Set<string>();
      
      // Group rows by channel to optimize database duplicate queries in batches
      const channelToExternalIds: Record<string, { rowIdx: number; extId: string }[]> = {};

      for (let i = 0; i < dataRows.length; i++) {
        const rowNum = i + 2; // header is row 1, index starts at 0
        const row = dataRows[i];
        if (!row) continue;

        const title = row[titleIdx] || "";
        const body = row[bodyIdx] || "";
        const channelStr = (row[channelIdx] || "").toUpperCase();
        const externalId = externalIdIdx !== undefined ? row[externalIdIdx] || null : null;
        const customerEmail = customerEmailIdx !== undefined ? row[customerEmailIdx] || null : null;
        const customerName = customerNameIdx !== undefined ? row[customerNameIdx] || null : null;
        const sourceUrl = sourceUrlIdx !== undefined ? row[sourceUrlIdx] || null : null;
        const language = languageIdx !== undefined ? row[languageIdx] || "en" : "en";
        const priorityStr = priorityIdx !== undefined ? row[priorityIdx] || "0" : "0";

        let rowHasError = false;

        // Required Validations
        if (!title.trim()) {
          errors.push({ row: rowNum, column: "title", message: "Title is required." });
          rowHasError = true;
        }
        if (!body.trim()) {
          errors.push({ row: rowNum, column: "body", message: "Feedback body is required." });
          rowHasError = true;
        }

        // Title length limit
        if (title.length > 240) {
          errors.push({ row: rowNum, column: "title", message: "Title exceeds maximum length of 240 characters." });
          rowHasError = true;
        }

        // Channel Validation & Mapping (SOCIAL_MEDIA -> SOCIAL)
        let normalizedChannel = channelStr;
        if (channelStr === "SOCIAL_MEDIA") {
          normalizedChannel = "SOCIAL";
        }

        if (!(normalizedChannel in Channel)) {
          errors.push({ row: rowNum, column: "channel", message: `Invalid channel "${row[channelIdx]}". Supported: ${Object.keys(Channel).join(", ")}, SOCIAL_MEDIA` });
          rowHasError = true;
        }

        // Customer Email Validation
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
          errors.push({ row: rowNum, column: "customerEmail", message: "Invalid email format." });
          rowHasError = true;
        }

        // Source URL Validation
        if (sourceUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(sourceUrl)) {
          errors.push({ row: rowNum, column: "sourceUrl", message: "Invalid URL format." });
          rowHasError = true;
        }

        if (rowHasError) {
          failedCount++;
          continue;
        }

        const finalChannel = normalizedChannel as Channel;

        // Check self-contained duplicates in CSV file
        if (externalId) {
          const uniqueKey = `${finalChannel}:${externalId}`;
          if (fileDuplicates.has(uniqueKey)) {
            errors.push({ row: rowNum, column: "externalId", message: `Duplicate row in CSV for channel ${finalChannel} and externalId ${externalId}.` });
            skippedCount++;
            continue;
          }
          fileDuplicates.add(uniqueKey);

          // Collect for DB duplicate checks
          if (!channelToExternalIds[finalChannel]) {
            channelToExternalIds[finalChannel] = [];
          }
          channelToExternalIds[finalChannel].push({ rowIdx: i, extId: externalId });
        }

        let parsedPriority = parseInt(priorityStr, 10);
        if (isNaN(parsedPriority)) parsedPriority = 0;

        validRows.push({
          workspaceId,
          title,
          body,
          channel: finalChannel,
          status: FeedbackStatus.NEW,
          externalId: externalId || null,
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          sourceUrl: sourceUrl || null,
          language,
          priority: parsedPriority,
        });
      }

      // Check duplicate records against database
      const finalValidRows: Prisma.FeedbackUncheckedCreateInput[] = [];
      const dbDuplicatesMap = new Set<string>();

      for (const [channelStr, extList] of Object.entries(channelToExternalIds)) {
        const channel = channelStr as Channel;
        const extIds = extList.map((e) => e.extId);
        
        const existingExtIds = await this.feedbackRepository.findExistingExternalIds(workspaceId, channel, extIds);
        existingExtIds.forEach((extId) => {
          dbDuplicatesMap.add(`${channel}:${extId}`);
        });
      }

      for (const item of validRows) {
        if (item.externalId) {
          const key = `${item.channel}:${item.externalId}`;
          if (dbDuplicatesMap.has(key)) {
            const index = dataRows.findIndex(
              (r) =>
                r &&
                externalIdIdx !== undefined &&
                r[externalIdIdx] === item.externalId &&
                (r[channelIdx] || "").toUpperCase() === item.channel
            );
            errors.push({
              row: index !== -1 ? index + 2 : 0,
              column: "externalId",
              message: `Duplicate record exists in database for channel ${item.channel} and externalId ${item.externalId}.`,
            });
            skippedCount++;
            continue;
          }
        }
        finalValidRows.push(item);
      }


      const summary: ImportSummary = {
        importedCount: finalValidRows.length,
        skippedCount,
        failedCount,
        errors,
      };

      return { ok: true, data: { validRows: finalValidRows, summary } };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to validate CSV data.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async importCSV(
    workspaceId: string,
    actorId: string,
    role: Role,
    validRows: Prisma.FeedbackUncheckedCreateInput[]
  ): Promise<ServiceResult<{ count: number }>> {
    try {
      if (role === Role.VIEWER) {
        return {
          ok: false,
          error: new ServiceError("Forbidden. Viewers cannot import feedback data.", "FORBIDDEN"),
        };
      }

      let count = 0;

      // Wrap in transaction so if any DB constraint check fails unexpectedly, we rollback completely
      await prisma.$transaction(async (tx) => {
        const repo = new FeedbackRepository({}, tx as unknown as PrismaClient);
        const res = await repo.createMany(validRows);
        count = res.count;
      });

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "CREATE",
        entityType: "Feedback",
        summary: `CSV Import: ${count} feedback records imported successfully.`,
      });

      return { ok: true, data: { count } };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Fatal error during CSV batch insertion. Transaction rolled back.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
