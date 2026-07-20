"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Lightbulb, MessageSquareCode, ArrowRight } from "lucide-react";
import type { AiPlaceholdersPayload } from "@/schemas/analytics.schema";

interface AiPlaceholdersProps {
  data: AiPlaceholdersPayload | undefined;
}

export function AiPlaceholders({ data }: AiPlaceholdersProps) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold tracking-tight text-foreground">AI Intelligence & Insights (Phase 7-10 Contracts)</h2>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 text-[10px] font-semibold">
          Architecture Prepared
        </Badge>
      </div>

      {/* 1. AI Executive Summary Banner */}
      <Card className="bg-gradient-to-r from-purple-950/20 via-background to-blue-950/20 border-purple-500/20">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] gap-1">
                <Sparkles className="h-3 w-3" /> Phase 7 Engine
              </Badge>
              <h3 className="text-sm font-bold text-foreground">{data.aiSummary.title}</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Ready for Phase 7 LLM Activation</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{data.aiSummary.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {data.aiSummary.keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground/90 bg-card/60 p-2 rounded border border-border/40">
                <span className="text-purple-400 font-bold">•</span>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2. Emerging Trends */}
        <Card className="bg-card/60 border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Emerging Trends
              </CardTitle>
              <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400">
                Phase 8 Cluster
              </Badge>
            </div>
            <CardDescription className="text-[11px]">Surging topics detected across feedback</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {data.emergingTrends.trends.map((t, i) => (
              <div key={i} className="p-2 bg-muted/40 rounded border border-border/40 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{t.topic}</span>
                  <span className="text-emerald-400 text-[11px]">{t.growth}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Recommended Actions */}
        <Card className="bg-card/60 border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Recommended Actions
              </CardTitle>
              <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-400">
                VoC Integration
              </Badge>
            </div>
            <CardDescription className="text-[11px]">AI-suggested workflow interventions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {data.recommendedActions.actions.map((act, i) => (
              <div key={i} className="p-2 bg-muted/40 rounded border border-border/40 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400 bg-amber-500/5">
                    {act.priority} PRIORITY
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{act.impact}</span>
                </div>
                <div className="text-xs font-semibold text-foreground">{act.action}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4. Ask LOOP (RAG) Conversational Queries */}
        <Card className="bg-card/60 border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquareCode className="h-3.5 w-3.5 text-blue-400" /> Ask LOOP (RAG)
              </CardTitle>
              <Badge variant="outline" className="text-[9px] border-blue-500/20 text-blue-400">
                Phase 9 Contract
              </Badge>
            </div>
            <CardDescription className="text-[11px]">Conversational analytics interfaces</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2 text-xs">
            <div className="p-2 bg-blue-950/20 border border-blue-500/20 rounded space-y-1.5">
              <div className="font-semibold text-foreground flex items-center gap-1">
                Try asking in Phase 9 <ArrowRight className="h-3 w-3 text-blue-400" />
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1 italic">
                <li>• &quot;How many negative feedback items did we receive this month?&quot;</li>
                <li>• &quot;Which channel generated the most feedback?&quot;</li>
                <li>• &quot;What are the top recurring theme clusters?&quot;</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
