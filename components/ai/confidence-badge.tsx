import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const isLowConfidence = confidence < 0.7;

  return (
    <Badge 
      variant="outline" 
      className={isLowConfidence ? "text-amber-600 border-amber-200 bg-amber-50" : "text-emerald-600 border-emerald-200 bg-emerald-50"}
    >
      {isLowConfidence ? (
        <AlertTriangle className="w-3 h-3 mr-1" />
      ) : (
        <CheckCircle2 className="w-3 h-3 mr-1" />
      )}
      {percentage}% Confidence
    </Badge>
  );
}
