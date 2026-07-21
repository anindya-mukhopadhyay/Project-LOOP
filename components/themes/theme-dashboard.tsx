/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ThemeDashboard = ({ data }: { data: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {data?.topThemes?.map((item: any) => (
              <li key={item.theme.id} className="flex justify-between py-2 border-b">
                <span>{item.theme.name}</span>
                <Badge variant="secondary">{item.analytics.feedbackCount} feedback</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Emerging Themes */}
      <EmergingThemeWidget themes={data?.emergingThemes} />
      
      {/* Declining Themes */}
      <DecliningThemeWidget themes={data?.decliningThemes} />
    </div>
  );
};

export const EmergingThemeWidget = ({ themes }: { themes: any[] }) => (
  <Card className="border-orange-200 bg-orange-50/50">
    <CardHeader>
      <CardTitle className="text-orange-700">Emerging Themes 🔥</CardTitle>
    </CardHeader>
    <CardContent>
      {themes?.length === 0 ? <p className="text-sm text-gray-500">No emerging themes</p> : (
        <ul className="space-y-2">
          {themes?.map((t: any) => (
            <li key={t.id} className="text-sm font-medium">{t.name}</li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export const DecliningThemeWidget = ({ themes }: { themes: any[] }) => (
  <Card className="border-blue-200 bg-blue-50/50">
    <CardHeader>
      <CardTitle className="text-blue-700">Declining Themes 📉</CardTitle>
    </CardHeader>
    <CardContent>
      {themes?.length === 0 ? <p className="text-sm text-gray-500">No declining themes</p> : (
        <ul className="space-y-2">
          {themes?.map((t: any) => (
            <li key={t.id} className="text-sm font-medium text-gray-600">{t.name}</li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export const ThemeSummaryCard = ({ summary, impact }: { summary: string, impact: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>AI Executive Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold">Summary</h4>
        <p className="text-sm text-gray-700">{summary || "Generating..."}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Business Impact</h4>
        <p className="text-sm text-gray-700">{impact || "Analyzing..."}</p>
      </div>
    </CardContent>
  </Card>
);

export const ThemeTrendBadge = ({ velocity }: { velocity: number }) => {
  if (velocity > 1) return <Badge className="bg-red-100 text-red-800">Trending Up</Badge>;
  if (velocity < -1) return <Badge className="bg-blue-100 text-blue-800">Trending Down</Badge>;
  return <Badge variant="outline">Stable</Badge>;
};

export const ThemeConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const percent = Math.round(confidence * 100);
  if (percent > 85) return <Badge className="bg-green-100 text-green-800">{percent}% High</Badge>;
  if (percent > 60) return <Badge className="bg-yellow-100 text-yellow-800">{percent}% Medium</Badge>;
  return <Badge className="bg-red-100 text-red-800">{percent}% Low</Badge>;
};

export const ThemeRelationshipGraphPlaceholder = () => (
  <Card className="border-dashed">
    <CardContent className="py-12 text-center text-gray-500">
      <p>Graph Visualization Placeholder</p>
      <p className="text-xs mt-2">Ready for Phase 10 / UI Enhancements</p>
    </CardContent>
  </Card>
);

// Placeholder for dialogs that would use standard Dialog UI components
export const MergeThemeDialog = () => <div />;
export const SplitThemeDialog = () => <div />;
export const ThemeTimeline = () => <div />;
export const ThemeExplorer = () => <div />;
export const ThemeDetailsPage = () => <div />;
export const ThemeAnalyticsPanel = () => <div />;
