import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassificationStatusBadge } from "./classification-status-badge";
import { ConfidenceBadge } from "./confidence-badge";
import { BrainCircuit, RefreshCw, AlertCircle } from "lucide-react";
import type { FeedbackAiMetadata } from "@/schemas/ai.schema";

interface AIClassificationPanelProps {
  metadata: FeedbackAiMetadata;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function AIClassificationPanel({ metadata, onRetry, isRetrying }: AIClassificationPanelProps) {
  const { status, classification, error, timeline, reviewStatus } = metadata;

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center text-indigo-900">
            <BrainCircuit className="w-4 h-4 mr-2 text-indigo-500" />
            AI Intelligence
          </CardTitle>
          <ClassificationStatusBadge status={status} />
        </div>
        {timeline?.completedAt ? (
          <CardDescription className="text-xs">
            Completed: {new Date(timeline.completedAt).toLocaleString()}
          </CardDescription>
        ) : timeline?.startedAt ? (
          <CardDescription className="text-xs">
            Started: {new Date(timeline.startedAt).toLocaleString()}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-4">
        {status === "FAILED" && (
          <div className="rounded-md bg-red-50 p-3 mb-4">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <div className="text-sm text-red-700">
                <span className="font-semibold block mb-1">Classification Failed: {error?.category || "UNKNOWN"}</span>
                {error?.message || "An unknown error occurred during AI processing."}
              </div>
            </div>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full border-red-200 text-red-700 hover:bg-red-100"
                onClick={onRetry}
                disabled={isRetrying}
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                Retry Classification
              </Button>
            )}
          </div>
        )}

        {classification && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <ConfidenceBadge confidence={classification.confidence} />
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground">
                  {classification.model} ({classification.promptVersion})
                </span>
                {reviewStatus && (
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                    {reviewStatus.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Emotion</span>
                <p className="text-sm font-medium">{classification.emotion}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Urgency</span>
                <p className="text-sm font-medium">{classification.urgency}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Intent</span>
                <p className="text-sm font-medium">{classification.intent}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Theme</span>
                <p className="text-sm font-medium">{classification.theme}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-indigo-100">
              <span className="text-xs font-semibold text-muted-foreground uppercase">AI Reasoning</span>
              <p className="text-sm text-gray-700 mt-1">{classification.reasoning}</p>
            </div>

            {classification.supportingEvidence && classification.supportingEvidence.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-100">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Supporting Evidence</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {classification.supportingEvidence.map((evidence, i) => (
                    <li key={i} className="text-sm text-gray-700 italic">"{evidence}"</li>
                  ))}
                </ul>
              </div>
            )}

            {onRetry && classification.confidence < 0.7 && (
               <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={onRetry}
                disabled={isRetrying}
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                Re-analyze (Low Confidence)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
