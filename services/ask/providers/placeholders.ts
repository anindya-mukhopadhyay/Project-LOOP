/* eslint-disable @typescript-eslint/no-unused-vars */
import { KnowledgeProvider } from "./knowledge.provider";
import { RankedDocument } from "../ranking.service";
import { SearchFilters } from "@/schemas/ask.schema";

export class DocumentProvider implements KnowledgeProvider {
  readonly type = "DOCUMENT";
  async search(_workspaceId: string, _query: string, _limit: number, _filters?: SearchFilters): Promise<RankedDocument[]> { return []; }
  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> { return null; }
}

export class SlackProvider implements KnowledgeProvider {
  readonly type = "SLACK";
  async search(_workspaceId: string, _query: string, _limit: number, _filters?: SearchFilters): Promise<RankedDocument[]> { return []; }
  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> { return null; }
}

export class GoogleDriveProvider implements KnowledgeProvider {
  readonly type = "GOOGLE_DRIVE";
  async search(_workspaceId: string, _query: string, _limit: number, _filters?: SearchFilters): Promise<RankedDocument[]> { return []; }
  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> { return null; }
}

export class PDFProvider implements KnowledgeProvider {
  readonly type = "PDF";
  async search(_workspaceId: string, _query: string, _limit: number, _filters?: SearchFilters): Promise<RankedDocument[]> { return []; }
  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> { return null; }
}
