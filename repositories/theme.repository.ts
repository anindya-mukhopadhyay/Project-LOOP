import { prisma } from "@/lib/database";
import { Theme, Prisma } from "@prisma/client";
import { ThemeMetadata } from "@/schemas/theme.schema";

export class ThemeRepository {
  async findById(id: string, workspaceId: string): Promise<Theme | null> {
    return prisma.theme.findUnique({
      where: { id, workspaceId },
    });
  }

  async findBySlug(slug: string, workspaceId: string): Promise<Theme | null> {
    return prisma.theme.findUnique({
      where: { workspaceId_slug: { slug, workspaceId } },
    });
  }

  async findAll(workspaceId: string): Promise<Theme[]> {
    return prisma.theme.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    workspaceId: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    metadata: ThemeMetadata;
    createdById?: string;
  }): Promise<Theme> {
    return prisma.theme.create({
      data: {
        ...data,
        metadata: data.metadata as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<{
      name: string;
      description: string;
      color: string;
      isArchived: boolean;
    }>
  ): Promise<Theme> {
    return prisma.theme.update({
      where: { id, workspaceId },
      data,
    });
  }

  async updateMetadata(
    id: string,
    workspaceId: string,
    metadataUpdater: (currentMetadata: ThemeMetadata) => ThemeMetadata
  ): Promise<Theme> {
    return prisma.$transaction(async (tx) => {
      const theme = await tx.theme.findUniqueOrThrow({
        where: { id, workspaceId },
      });

      const currentMetadata = (theme.metadata as unknown as ThemeMetadata) || {
        lifecycleState: "NEW",
        timeline: [],
        relationships: { parents: [], children: [], related: [] },
        ai: {},
      };

      const newMetadata = metadataUpdater(currentMetadata);

      return tx.theme.update({
        where: { id, workspaceId },
        data: {
          metadata: newMetadata as unknown as Prisma.InputJsonValue,
        },
      });
    });
  }

  async delete(id: string, workspaceId: string): Promise<Theme> {
    return prisma.theme.update({
      where: { id, workspaceId },
      data: { deletedAt: new Date() },
    });
  }
}
