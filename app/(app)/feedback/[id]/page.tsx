"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Calendar, User, Link2, BrainCircuit, ShieldAlert, Award, FileText, Check } from "lucide-react";
import type { Feedback, FeedbackStatus, Sentiment } from "@prisma/client";

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [feedback, setFeedback] = useState<(Feedback & { createdBy?: { id: string; name: string | null; email: string | null } | null; feedbackTheme?: { theme: { name: string } }[] }) | null>(null);
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    // Load current user context
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const json = await res.json();
          setCurrentUser(json.user || { role: "VIEWER" });
        }
      } catch {
        setCurrentUser({ role: "VIEWER" });
      }
    };

    fetchUser();
  }, []);

  const fetchDetails = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/feedback/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load feedback details.");
      }
      setFeedback(json.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load details.");
      router.push("/feedback");
    } finally {
      setIsFetching(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    setIsMutating(true);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          lastUpdatedAt: feedback?.updatedAt,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update status workflow.");
      }

      toast.success(`Status updated to ${newStatus}`);
      fetchDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update workflow.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRestore = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`/api/feedback/${id}?restore=true`, {
        method: "PATCH",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to restore feedback log.");
      }

      toast.success("Feedback log restored successfully.");
      fetchDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete feedback.");
      }

      toast.success("Feedback log soft-deleted.");
      router.push("/feedback");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setIsMutating(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!feedback) return null;

  const isViewer = currentUser?.role === "VIEWER";
  const isAdmin = currentUser?.role === "ADMIN";

  const getChannelLabel = (channel: string) => {
    return channel === "SOCIAL" ? "SOCIAL_MEDIA" : channel;
  };

  const getSentimentVariant = (sentiment: Sentiment) => {
    switch (sentiment) {
      case "POSITIVE":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "NEGATIVE":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link href="/feedback" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Feedback Inbox
          </Link>
        </Button>

        {feedback.deletedAt ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/25 px-3 py-1 font-semibold flex gap-1">
              <ShieldAlert className="h-3 w-3" /> Soft Deleted
            </Badge>
            {isAdmin && (
              <Button onClick={handleRestore} disabled={isMutating} variant="outline" size="sm">
                {isMutating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Restore Log
              </Button>
            )}
          </div>
        ) : (
          !isViewer && (
            <Button onClick={handleDelete} disabled={isMutating} variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20">
              {isMutating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Delete Log
            </Button>
          )
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Feedback Body & Sentiment */}
        <div className="col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="space-y-2 border-b">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border font-medium bg-muted/40">
                  {getChannelLabel(feedback.channel)}
                </Badge>
                <Badge variant="outline" className="border-sky-500/20 text-sky-500 bg-sky-500/5 font-semibold">
                  {feedback.status}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">{feedback.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Logged on{" "}
                {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 border border-border/40 rounded-xl">
                {feedback.body}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Transitions */}
          {!isViewer && !feedback.deletedAt && (
            <Card className="border border-border/80 shadow-md">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Transition Workflow Status
                </CardTitle>
                <CardDescription>Move the status boundary forwards or backwards.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex gap-3">
                <Button
                  onClick={() => handleStatusChange("NEW")}
                  variant={feedback.status === "NEW" ? "default" : "outline"}
                  disabled={isMutating}
                  size="sm"
                  className="flex gap-1"
                >
                  {feedback.status === "NEW" && <Check className="h-4 w-4" />}
                  NEW
                </Button>
                <Button
                  onClick={() => handleStatusChange("REVIEWED")}
                  variant={feedback.status === "REVIEWED" ? "default" : "outline"}
                  disabled={isMutating}
                  size="sm"
                  className="flex gap-1"
                >
                  {feedback.status === "REVIEWED" && <Check className="h-4 w-4" />}
                  REVIEWED
                </Button>
                <Button
                  onClick={() => handleStatusChange("ACTIONED")}
                  variant={feedback.status === "ACTIONED" ? "default" : "outline"}
                  disabled={isMutating}
                  size="sm"
                  className="flex gap-1"
                >
                  {feedback.status === "ACTIONED" && <Check className="h-4 w-4" />}
                  ACTIONED
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline Placeholder */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Activity Timeline</CardTitle>
              <CardDescription>Future updates, comments, and action history.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-center py-8 text-muted-foreground text-xs font-semibold">
              <FileText className="h-6 w-6 mx-auto mb-2 text-muted" />
              Timeline logging is integrated with the global workspace activity log.
              <br />
              Detailed sub-actions will be rendered here in subsequent phases.
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Info & AI Classification */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Customer Name:</span>
                <span className="font-bold">{feedback.customerName || "Anonymous"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Customer Email:</span>
                <span className="font-bold">{feedback.customerEmail || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Source Ref:</span>
                {feedback.sourceUrl ? (
                  <a
                    href={feedback.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    Link <Link2 className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="font-bold text-muted-foreground">None</span>
                )}
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Priority Level:</span>
                <span className="font-bold">{feedback.priority}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Language:</span>
                <span className="font-bold">{feedback.language.toUpperCase()}</span>
              </div>
              {feedback.createdBy && (
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Logged By:
                  </span>
                  <span className="font-bold">{feedback.createdBy.name || feedback.createdBy.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" /> AI Insights Placeholder
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">AI Sentiment</div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${getSentimentVariant(feedback.sentiment)}`}>
                    {feedback.sentiment}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground">
                    Score: {feedback.score ? parseFloat(String(feedback.score)).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-3">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Assigned Theme</div>
                {feedback.feedbackTheme && feedback.feedbackTheme.length > 0 ? (
                  <Badge variant="outline" className="border-teal-500/20 text-teal-500 bg-teal-500/5">
                    {feedback.feedbackTheme?.[0]?.theme?.name}
                  </Badge>
                ) : (
                  <div className="text-xs text-muted-foreground italic font-semibold">Unclassified (Pending AI run)</div>
                )}
              </div>

              <div className="space-y-1 border-t pt-3">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Feature Area Classification</div>
                <div className="text-xs text-muted-foreground italic font-semibold">Not Analyzed</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
