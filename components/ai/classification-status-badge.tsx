import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { AiStatus } from "@/schemas/ai.schema";

interface ClassificationStatusBadgeProps {
  status: AiStatus;
}

export function ClassificationStatusBadge({ status }: ClassificationStatusBadgeProps) {
  switch (status) {
    case "QUEUED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" /> Queued
        </Badge>
      );
    case "STARTED":
    case "RETRYING":
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {status === "RETRYING" ? "Retrying..." : "Processing..."}
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> AI Classified
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="default" className="bg-red-600 hover:bg-red-700">
          <XCircle className="w-3 h-3 mr-1" /> AI Failed
        </Badge>
      );
    default:
      return null;
  }
}
