"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { StructuredReport, Recommendation } from "@/schemas/report.schema";

interface ExecutiveSummaryViewerProps {
  report: StructuredReport;
}

export function ExecutiveSummaryViewer({ report }: ExecutiveSummaryViewerProps) {
  // Find key sections
  const execSummary = report.sections.find(s => s.type === 'EXECUTIVE_SUMMARY')?.content;
  const recommendations = report.sections.find(s => s.type === 'RECOMMENDATIONS')?.content;
  const businessImpact = report.sections.find(s => s.type === 'BUSINESS_IMPACT')?.content;

  return (
    <div className="space-y-6">
      {/* Business Health Score */}
      {businessImpact && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Business Impact Score</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold">{businessImpact.score}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Sentiment</span>
                  <span>{businessImpact.factors.sentiment}%</span>
                </div>
                <Progress value={businessImpact.factors.sentiment} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span>Urgency</span>
                  <span>{businessImpact.factors.urgency}%</span>
                </div>
                <Progress value={businessImpact.factors.urgency} className="h-1 bg-red-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Highlights */}
      {execSummary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                {execSummary.topRisks.map((risk: string, i: number) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                {execSummary.opportunities.map((opp: string, i: number) => (
                  <li key={i}>{opp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && Array.isArray(recommendations) && (
        <Card>
          <CardHeader>
            <CardTitle>Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec: Recommendation, i: number) => (
              <div key={i} className="flex flex-col space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <div className="flex space-x-2">
                    <Badge variant={rec.priority === 'CRITICAL' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline">{rec.timeHorizon.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <div className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                  <span className="font-medium text-foreground">Expected Impact:</span> {rec.expectedImpact}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
