import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AuditAction,
  Channel,
  ConversationStatus,
  FeedbackStatus,
  MessageRole,
  NotificationStatus,
  NotificationType,
  Prisma,
  type Feedback,
  PrismaClient,
  ReportStatus,
  Role,
  Sentiment,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before running the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const workspaceSlug = "acme-loop";

const themeDefinitions = [
  ["Onboarding experience", "Friction in setup, activation, and first value."],
  ["Search quality", "Relevance, ranking, and discoverability of search results."],
  ["Mobile performance", "Speed, stability, and responsiveness on mobile devices."],
  ["Billing clarity", "Invoices, pricing visibility, and subscription understanding."],
  ["Team collaboration", "Sharing, comments, assignments, and collaborative workflows."],
  ["Integrations", "Connections to external tools and synchronization reliability."],
  ["Notifications", "Timeliness, relevance, and control of product notifications."],
  ["Reporting", "Dashboards, exports, and the usefulness of business insights."],
  ["Customer support", "Support response quality, speed, and resolution outcomes."],
  ["Accessibility", "Keyboard navigation, contrast, screen reader, and inclusive UX."],
  ["Data export", "Export formats, completeness, and portability of customer data."],
  ["API reliability", "API consistency, uptime, latency, and developer experience."],
  ["Permissions", "Workspace roles, access boundaries, and administrative controls."],
  ["Dashboard customization", "Personalization of views, filters, and saved layouts."],
  ["Import workflow", "Bulk imports, mapping, validation, and error recovery."],
  ["AI insights", "Accuracy, explainability, and usefulness of AI-generated analysis."],
  ["Content organization", "Tags, folders, taxonomy, and keeping feedback structured."],
  ["Workflow automation", "Rules, triggers, routing, and reducing repetitive work."],
  ["Reliability", "Crashes, downtime, consistency, and trust in daily operations."],
  ["Performance", "Latency and responsiveness across core product workflows."],
] as const;

const firstNames = [
  "Maya",
  "Noah",
  "Priya",
  "Lucas",
  "Sofia",
  "Ethan",
  "Ava",
  "Arjun",
  "Elena",
  "Kai",
];

const companies = [
  "Northstar Labs",
  "Brightline Health",
  "Orbit Commerce",
  "Cedar Finance",
  "Atlas Learning",
  "Juniper Cloud",
  "Mosaic Travel",
  "Summit Works",
];

const feedbackBodies = [
  "The workflow feels thoughtful overall, but this step took longer than expected and made it hard to see what to do next.",
  "This has become part of our daily routine. The output is useful, though a little more control would make it easier to fit our process.",
  "We noticed inconsistent behavior this week. It did not block the team, but it reduced confidence in the result.",
  "The latest update is a clear improvement. We were able to complete the task without needing support or a workaround.",
  "Our team needs a faster way to handle this at scale. The current flow works for a few records but becomes tedious for larger batches.",
  "The product is close to solving this for us. Better visibility into status and ownership would make the experience much stronger.",
];

const channels = Object.values(Channel);
const sentiments = Object.values(Sentiment);
const statuses = Object.values(FeedbackStatus);

function dateDaysAgo(days: number, hour = 10): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

function vectorFor(seed: number): number[] {
  return Array.from({ length: 8 }, (_, index) => {
    const value = Math.sin(seed * 13 + index * 7) * 0.5;
    return Number(value.toFixed(6));
  });
}

function at<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`Seed fixture index ${index} is out of bounds.`);
  }
  return item;
}

async function clearSampleWorkspace(): Promise<void> {
  const existing = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });

  if (!existing) return;

  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.embedding.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.message.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.conversation.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.notification.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.report.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.feedbackTheme.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.feedback.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.theme.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.invitation.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.user.deleteMany({ where: { workspaceId: existing.id } }),
    prisma.workspace.delete({ where: { id: existing.id } }),
  ]);
}

async function main(): Promise<void> {
  await clearSampleWorkspace();

  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Corporation",
      slug: workspaceSlug,
      domain: "acme.example",
      plan: "growth",
      metadata: { source: "seed", industry: "software" },
    },
  });

  const users = await Promise.all(
    [
      ["maya@acme.example", "Maya Chen", Role.ADMIN],
      ["noah@acme.example", "Noah Williams", Role.ANALYST],
      ["priya@acme.example", "Priya Shah", Role.VIEWER],
    ].map(([email, name, role]) =>
      prisma.user.create({
        data: {
          workspaceId: workspace.id,
          email: email as string,
          name: name as string,
          role: role as Role,
          emailVerified: dateDaysAgo(90),
          lastSeenAt: dateDaysAgo(Number(role === Role.ADMIN ? 0 : 2)),
          metadata: { source: "seed" },
        },
      }),
    ),
  );
  const admin = at(users, 0);
  const analyst = at(users, 1);
  const viewer = at(users, 2);

  const themes = await Promise.all(
    themeDefinitions.map(([name, description], index) =>
      prisma.theme.create({
        data: {
          workspaceId: workspace.id,
          name,
          slug: name.toLowerCase().replaceAll(" ", "-"),
          description,
          color: at(["#14b8a6", "#6366f1", "#f97316", "#ec4899", "#22c55e"], index % 5),
          confidence: (0.78 + (index % 20) / 100).toFixed(4),
          createdById: analyst.id,
          metadata: { source: "seed", priority: index < 5 ? "high" : "normal" },
        },
      }),
    ),
  );

  await prisma.embedding.createMany({
    data: themes.map((theme, index) => ({
      workspaceId: workspace.id,
      themeId: theme.id,
      contentHash: `theme-${index + 1}`,
      provider: "seed",
      model: "loop-demo-embedding-1",
      dimensions: 8,
      vector: vectorFor(index + 1),
      metadata: { source: "seed", contentType: "theme" },
    })),
  });

  const feedback: Feedback[] = [];
  for (let index = 0; index < 120; index += 1) {
    const customerIndex = index % firstNames.length;
    const channel = at(channels, index % channels.length);
    const status = at(statuses, index % statuses.length);
    const sentiment = at(sentiments, index % sentiments.length);
    const createdAt = dateDaysAgo(index % 90, 8 + (index % 10));
    const feedbackItem = await prisma.feedback.create({
      data: {
        workspaceId: workspace.id,
        externalId: `feedback-${String(index + 1).padStart(4, "0")}`,
        customerName: `${at(firstNames, customerIndex)} ${at(["Martin", "Patel", "Garcia", "Kim", "Brown"], index % 5)}`,
        customerEmail: `${at(firstNames, customerIndex).toLowerCase()}${index + 1}@${at(
          companies,
          index % companies.length,
        )
          .toLowerCase()
          .replaceAll(" ", "")}.example`,
        title: `${at(themeDefinitions, index % themeDefinitions.length)[0]} feedback from ${at(companies, index % companies.length)}`,
        body: at(feedbackBodies, index % feedbackBodies.length),
        channel,
        status,
        sentiment,
        language: index % 17 === 0 ? "es" : "en",
        sourceUrl: `https://feedback.example/items/${index + 1}`,
        priority: index % 10 === 0 ? 2 : index % 3 === 0 ? 1 : 0,
        score: (0.35 + ((index * 17) % 60) / 100).toFixed(4),
        metadata: { source: "seed", importBatch: `batch-${Math.floor(index / 20) + 1}` },
        receivedAt: createdAt,
        reviewedAt:
          status === FeedbackStatus.NEW ? null : new Date(createdAt.getTime() + 86_400_000),
        actionedAt:
          status === FeedbackStatus.ACTIONED ? new Date(createdAt.getTime() + 172_800_000) : null,
        createdById: index % 2 === 0 ? analyst.id : admin.id,
        assignedToId: index % 4 === 0 ? viewer.id : analyst.id,
        createdAt,
      },
    });
    feedback.push(feedbackItem);
  }

  await prisma.feedbackTheme.createMany({
    data: feedback.flatMap((item, index) => {
      const primaryTheme = at(themes, index % themes.length);
      const secondaryTheme = at(themes, (index * 7 + 3) % themes.length);
      return [
        {
          workspaceId: workspace.id,
          feedbackId: item.id,
          themeId: primaryTheme.id,
          confidence: (0.72 + (index % 25) / 100).toFixed(4),
          assignedBy: index % 3 === 0 ? "ai" : analyst.id,
          metadata: { source: "seed", rank: 1 },
        },
        ...(primaryTheme.id === secondaryTheme.id
          ? []
          : [
              {
                workspaceId: workspace.id,
                feedbackId: item.id,
                themeId: secondaryTheme.id,
                confidence: (0.55 + (index % 20) / 100).toFixed(4),
                assignedBy: "ai",
                metadata: { source: "seed", rank: 2 },
              },
            ]),
      ];
    }),
  });

  await prisma.embedding.createMany({
    data: feedback
      .filter((_, index) => index % 5 === 0)
      .map((item, index) => ({
        workspaceId: workspace.id,
        feedbackId: item.id,
        contentHash: `feedback-${index + 1}`,
        provider: "seed",
        model: "loop-demo-embedding-1",
        dimensions: 8,
        vector: vectorFor(index + 101),
        metadata: { source: "seed", contentType: "feedback" },
      })),
  });

  const reports = await Promise.all(
    [
      ["Weekly customer signal summary", ReportStatus.READY],
      ["Monthly product opportunities", ReportStatus.SCHEDULED],
      ["Onboarding friction deep dive", ReportStatus.DRAFT],
    ].map(([title, status], index) =>
      prisma.report.create({
        data: {
          workspaceId: workspace.id,
          createdById: analyst.id,
          title: title as string,
          slug: (title as string).toLowerCase().replaceAll(" ", "-"),
          description: "A seeded report fixture for validating reporting workflows.",
          status: status as ReportStatus,
          filters: { dateRange: index === 1 ? "30d" : "7d", channels: channels.slice(0, 4) },
          metrics: { feedbackCount: index === 0 ? 120 : 48, negativeRate: 0.28 + index / 10 },
          narrative:
            index === 0
              ? "Customers consistently value the core workflow while requesting faster setup and clearer reporting."
              : null,
          scheduledAt: index === 1 ? dateDaysAgo(-7) : null,
          generatedAt: index === 0 ? dateDaysAgo(1) : null,
        },
      }),
    ),
  );

  const conversation = await prisma.conversation.create({
    data: {
      workspaceId: workspace.id,
      userId: analyst.id,
      title: "What is driving onboarding dissatisfaction?",
      status: ConversationStatus.OPEN,
      metadata: { source: "seed", model: "loop-demo" },
    },
  });
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        workspaceId: workspace.id,
        conversationId: conversation.id,
        userId: analyst.id,
        role: MessageRole.USER,
        content: "What is driving onboarding dissatisfaction?",
        citations: [],
        metadata: { source: "seed" },
      },
    }),
    prisma.message.create({
      data: {
        workspaceId: workspace.id,
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content:
          "The strongest onboarding theme is setup friction, especially around unclear next steps and import validation. It appears in 18% of recent negative feedback.",
        citations: [{ feedbackId: at(feedback, 0).id, themeId: at(themes, 0).id }],
        metadata: { source: "seed", model: "loop-demo" },
      },
    }),
    prisma.message.create({
      data: {
        workspaceId: workspace.id,
        conversationId: conversation.id,
        userId: analyst.id,
        role: MessageRole.USER,
        content: "Which customer segments mention it most often?",
        citations: [],
        metadata: { source: "seed" },
      },
    }),
    prisma.message.create({
      data: {
        workspaceId: workspace.id,
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content:
          "Growth-stage teams with larger imports mention it most often. Their feedback also connects onboarding friction with reporting expectations.",
        citations: [{ feedbackId: at(feedback, 5).id, themeId: at(themes, 14).id }],
        metadata: { source: "seed", model: "loop-demo" },
      },
    }),
  ]);
  await prisma.embedding.createMany({
    data: messages
      .filter((_, index) => index % 2 === 1)
      .map((message, index) => ({
        workspaceId: workspace.id,
        messageId: message.id,
        contentHash: `message-${index + 1}`,
        provider: "seed",
        model: "loop-demo-embedding-1",
        dimensions: 8,
        vector: vectorFor(index + 201),
        metadata: { source: "seed", contentType: "message" },
      })),
  });

  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: analyst.id,
        type: NotificationType.REPORT_READY,
        status: NotificationStatus.UNREAD,
        title: "Weekly report is ready",
        body: "Your customer signal summary finished generating.",
        actionUrl: `/reports/${at(reports, 0).id}`,
        reportId: at(reports, 0).id,
        metadata: { source: "seed" },
      },
      {
        workspaceId: workspace.id,
        userId: admin.id,
        type: NotificationType.INVITATION_SENT,
        status: NotificationStatus.READ,
        title: "Workspace invitation sent",
        body: "A new teammate has been invited to Acme Corporation.",
        readAt: dateDaysAgo(1),
        readById: admin.id,
        metadata: { source: "seed" },
      },
      {
        workspaceId: workspace.id,
        userId: analyst.id,
        type: NotificationType.THEME_DETECTED,
        status: NotificationStatus.UNREAD,
        title: "New theme detected",
        body: "AI identified a rising signal around onboarding experience.",
        metadata: { source: "seed", themeId: at(themes, 0).id },
      },
      {
        workspaceId: workspace.id,
        userId: viewer.id,
        type: NotificationType.FEEDBACK_ASSIGNED,
        status: NotificationStatus.ARCHIVED,
        title: "Feedback assigned",
        body: "You were assigned a customer feedback item.",
        metadata: { source: "seed", feedbackId: at(feedback, 3).id },
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: Array.from({ length: 12 }, (_, index) => ({
      workspaceId: workspace.id,
      actorId: index % 3 === 0 ? admin.id : analyst.id,
      action: at(
        [AuditAction.CREATE, AuditAction.CLASSIFY, AuditAction.CLUSTER, AuditAction.EXPORT],
        index % 4,
      ),
      entityType: index % 2 === 0 ? "Feedback" : "Theme",
      entityId: index % 2 === 0 ? at(feedback, index).id : at(themes, index % themes.length).id,
      summary: index % 2 === 0 ? "Feedback imported and classified" : "Theme assignment refreshed",
      before: index % 4 === 0 ? Prisma.JsonNull : {},
      after: { source: "seed", index },
      ipAddress: "203.0.113.10",
      userAgent: "Project LOOP seed",
      metadata: { source: "seed" },
      createdAt: dateDaysAgo(index + 1),
    })),
  });

  console.log(`Seeded ${workspace.name}: 3 users, 20 themes, 120 feedback items.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
