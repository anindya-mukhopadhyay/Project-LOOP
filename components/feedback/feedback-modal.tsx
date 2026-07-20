"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Channel, FeedbackStatus, Sentiment } from "@prisma/client";
import { createFeedbackSchema, updateFeedbackSchema, type CreateFeedbackInput, type UpdateFeedbackInput } from "@/schemas/feedback.schema";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackId?: string | null;
  onSuccess: () => void;
}

export function FeedbackModal({ isOpen, onClose, feedbackId, onSuccess }: FeedbackModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");

  const isEditMode = !!feedbackId;

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFeedbackInput & UpdateFeedbackInput>({
    resolver: zodResolver(isEditMode ? updateFeedbackSchema : createFeedbackSchema) as unknown as Resolver<CreateFeedbackInput & UpdateFeedbackInput>,
    defaultValues: {
      title: "",
      body: "",
      channel: "EMAIL",
      status: "NEW",
      customerName: "",
      customerEmail: "",
      sourceUrl: "",
      language: "en",
      priority: 0,
      sentiment: "NEUTRAL",
      score: 0,
    },
  });

  const selectedChannel = watch("channel");
  const selectedStatus = watch("status");
  const selectedSentiment = watch("sentiment");

  // Load existing feedback details if editing
  useEffect(() => {
    if (!feedbackId || !isOpen) return;

    const fetchDetails = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/feedback/${feedbackId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load feedback details.");
        }

        const f = json.data;
        setValue("title", f.title);
        setValue("body", f.body);
        setValue("channel", f.channel);
        setValue("status", f.status);
        setValue("customerName", f.customerName || "");
        setValue("customerEmail", f.customerEmail || "");
        setValue("sourceUrl", f.sourceUrl || "");
        setValue("language", f.language || "en");
        setValue("priority", f.priority || 0);
        setValue("sentiment", f.sentiment || "NEUTRAL");
        setValue("score", f.score ? parseFloat(f.score) : 0);
        setLastUpdatedAt(f.updatedAt);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load details.");
        onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchDetails();
  }, [feedbackId, isOpen, setValue, onClose]);

  const onSubmit = async (data: CreateFeedbackInput & UpdateFeedbackInput) => {
    setIsLoading(true);
    try {
      const url = isEditMode ? `/api/feedback/${feedbackId}` : "/api/feedback";
      const method = isEditMode ? "PATCH" : "POST";

      const payload = { ...data };
      if (isEditMode && lastUpdatedAt) {
        payload.lastUpdatedAt = lastUpdatedAt;
      }

      payload.priority = parseInt(String(payload.priority), 10) || 0;
      if (payload.score !== undefined) {
        payload.score = parseFloat(String(payload.score)) || 0;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save feedback.");
      }

      toast.success(isEditMode ? "Feedback updated successfully." : "Feedback created successfully.");
      onSuccess();
      onClose();
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border shadow-2xl rounded-2xl w-full max-w-lg p-6 flex flex-col max-h-[90vh]">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {isEditMode ? "Edit Feedback Log" : "Log Manual Feedback"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEditMode
              ? "Modify customer content, status workflows, and metadata parameters."
              : "Create a new customer feedback entry inside the active workspace."}
          </p>
        </div>

        {isFetching ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of feedback..."
                {...register("title")}
                className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="body" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                Feedback Content <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="body"
                rows={4}
                placeholder="Paste original email, survey comment, or support transcript..."
                {...register("body")}
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  errors.body ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {errors.body && (
                <p className="text-xs text-destructive font-medium">{errors.body.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="channel" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  Channel <span className="text-destructive">*</span>
                </Label>
                <select
                  value={selectedChannel || ""}
                  onChange={(e) => setValue("channel", e.target.value as Channel)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.keys(Channel).map((c) => (
                    <option key={c} value={c}>
                      {c === "SOCIAL" ? "SOCIAL_MEDIA" : c}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode ? (
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    Workflow Status
                  </Label>
                  <select
                    value={selectedStatus || ""}
                    onChange={(e) => setValue("status", e.target.value as FeedbackStatus)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Object.keys(FeedbackStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="priority" className="text-xs font-semibold text-muted-foreground">
                    Priority Score (0-100)
                  </Label>
                  <Input
                    id="priority"
                    type="number"
                    min={0}
                    max={100}
                    {...register("priority")}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border/40 my-2 pt-2">
              <div className="text-xs font-semibold text-foreground/80 mb-2">Customer & Metadata (Optional)</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="e.g. John Doe"
                    {...register("customerName")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="customerEmail" className="text-xs font-semibold text-muted-foreground">
                    Customer Email
                  </Label>
                  <Input
                    id="customerEmail"
                    placeholder="e.g. name@domain.com"
                    {...register("customerEmail")}
                    className={errors.customerEmail ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.customerEmail && (
                    <p className="text-xs text-destructive font-medium">{errors.customerEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-1">
                  <Label htmlFor="sourceUrl" className="text-xs font-semibold text-muted-foreground">
                    Source Link URL
                  </Label>
                  <Input
                    id="sourceUrl"
                    placeholder="https://..."
                    {...register("sourceUrl")}
                    className={errors.sourceUrl ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.sourceUrl && (
                    <p className="text-xs text-destructive font-medium">{errors.sourceUrl.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="language" className="text-xs font-semibold text-muted-foreground">
                    Language ISO Code
                  </Label>
                  <Input
                    id="language"
                    placeholder="en"
                    {...register("language")}
                  />
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="border-t border-border/40 my-2 pt-2 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sentiment" className="text-xs font-semibold text-muted-foreground">
                    Sentiment Type
                  </Label>
                  <select
                    value={selectedSentiment || ""}
                    onChange={(e) => setValue("sentiment", e.target.value as Sentiment)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Object.keys(Sentiment).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="score" className="text-xs font-semibold text-muted-foreground">
                    Sentiment Score (-1.0 to 1.0)
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.01"
                    min="-1"
                    max="1"
                    {...register("score")}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/40 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Log Feedback"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
