"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Search,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Download,
  AlertCircle,
} from "lucide-react";
import type { FeedbackStatus } from "@prisma/client";
import type { PaginatedFeedback } from "@/services/feedback.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { CsvWizard } from "@/components/feedback/csv-wizard";

interface ThemeOption {
  id: string;
  name: string;
}

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ role: string; id: string } | null>(null);

  // Lists & pagination
  const [feedbackData, setFeedbackData] = useState<PaginatedFeedback | null>(null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering / Search States
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [sentimentFilter, setSentimentFilter] = useState<string>("ALL");
  const [themeFilter, setThemeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals & workflows
  const [isCsvWizardOpen, setIsCsvWizardOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBulkMutating, setIsBulkMutating] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.user || { role: "VIEWER", id: "" });
      }
    } catch {
      setCurrentUser({ role: "VIEWER", id: "" });
    }
  };

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setThemes(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to load workspace themes filter options:", e);
    }
  };

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        sortBy,
        sortOrder,
      });

      if (query.trim()) params.append("query", query);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (channelFilter !== "ALL") params.append("channel", channelFilter);
      if (sentimentFilter !== "ALL") params.append("sentiment", sentimentFilter);
      if (themeFilter !== "ALL") params.append("themeId", themeFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load feedback logs.");
      }

      setFeedbackData(json.data);
      setSelectedIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder, query, statusFilter, channelFilter, sentimentFilter, themeFilter]);

  useEffect(() => {
    fetchCurrentUser();
    fetchThemes();
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus: FeedbackStatus) => {
    if (selectedIds.length === 0) return;
    setIsBulkMutating(true);
    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "STATUS_UPDATE",
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Bulk update failed.");
      }

      toast.success(`Successfully updated ${selectedIds.length} logs to ${newStatus}`);
      setSelectedIds([]);
      fetchFeedback();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk action failed.");
    } finally {
      setIsBulkMutating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to soft delete / archive ${selectedIds.length} feedback items?`)) return;

    setIsBulkMutating(true);
    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "DELETE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Bulk delete failed.");
      }

      toast.success(`Successfully soft-deleted ${selectedIds.length} logs.`);
      setSelectedIds([]);
      fetchFeedback();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk action failed.");
    } finally {
      setIsBulkMutating(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.append("query", query);
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (channelFilter !== "ALL") params.append("channel", channelFilter);
    if (sentimentFilter !== "ALL") params.append("sentiment", sentimentFilter);
    if (themeFilter !== "ALL") params.append("themeId", themeFilter);
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    window.open(`/api/feedback/export?${params.toString()}`, "_blank");
    toast.success("Downloading feedback CSV export...");
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete / archive this feedback log?")) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete feedback.");
      }
      toast.success("Feedback log soft-deleted.");
      fetchFeedback();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete feedback.");
    }
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (!feedbackData) return;
    const items = feedbackData.items;
    const allIds = items.map((item) => item.id);
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const isViewer = currentUser?.role === "VIEWER";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-md p-6 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Inbox</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                Feedback Ingestion
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
                Manage, review, filter, and import feedback logs coming from customer emails, surveys, support tickets, and platforms.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExport} className="flex gap-1.5 font-semibold">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            {!isViewer && (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsCsvWizardOpen(true)} className="flex gap-1.5 font-semibold">
                  <Upload className="h-4 w-4" /> Import CSV
                </Button>
                <Button size="sm" onClick={() => { setEditingId(null); setIsFormOpen(true); }} className="flex gap-1.5 font-semibold">
                  <Plus className="h-4 w-4" /> Log Feedback
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Search className="h-3 w-3" /> Search Contents
              </Label>
              <Input
                placeholder="Search title, email..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Channel</Label>
              <select
                value={channelFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setChannelFilter(e.target.value); setPage(1); }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Channels</option>
                <option value="EMAIL">EMAIL</option>
                <option value="SURVEY">SURVEY</option>
                <option value="APP_STORE">APP_STORE</option>
                <option value="PLAY_STORE">PLAY_STORE</option>
                <option value="SUPPORT">SUPPORT</option>
                <option value="SOCIAL">SOCIAL_MEDIA</option>
                <option value="SALES">SALES</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Workflow Status</Label>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="REVIEWED">REVIEWED</option>
                <option value="ACTIONED">ACTIONED</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">AI Sentiment</Label>
              <select
                value={sentimentFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSentimentFilter(e.target.value); setPage(1); }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Sentiments</option>
                <option value="POSITIVE">POSITIVE</option>
                <option value="NEUTRAL">NEUTRAL</option>
                <option value="NEGATIVE">NEGATIVE</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">AI Mapped Theme</Label>
              <select
                value={themeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setThemeFilter(e.target.value); setPage(1); }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Themes</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between p-3 border border-primary/20 bg-primary/5 backdrop-blur-md rounded-xl shadow-md gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckSquare className="h-4 w-4" />
            <span>{selectedIds.length} feedback items selected</span>
          </div>

          <div className="flex items-center gap-2">
            {!isViewer && (
              <>
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBulkStatusChange(e.target.value as FeedbackStatus)}
                  disabled={isBulkMutating}
                  className="flex h-8 w-[140px] rounded-md border border-input bg-background px-2 py-0 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Update Status...</option>
                  <option value="NEW">NEW</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="ACTIONED">ACTIONED</option>
                </select>

                <Button
                  onClick={handleBulkDelete}
                  disabled={isBulkMutating}
                  variant="outline"
                  size="sm"
                  className="h-8 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive bg-background font-semibold"
                >
                  Delete
                </Button>
              </>
            )}
            
            <Button onClick={() => setSelectedIds([])} variant="ghost" size="sm" className="h-8 font-semibold">
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : feedbackData ? (
        <div className="space-y-4">
          <FeedbackTable
            items={feedbackData.items}
            selectedIds={selectedIds}
            onSelectToggle={handleSelectToggle}
            onSelectAllToggle={handleSelectAllToggle}
            onSortChange={handleSortChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onEditClick={(id) => { setEditingId(id); setIsFormOpen(true); }}
            onDeleteClick={handleDeleteClick}
            userRole={currentUser?.role || "VIEWER"}
          />

          {feedbackData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-xs font-semibold text-muted-foreground">
              <div>
                Showing {((page - 1) * perPage) + 1} to{" "}
                {Math.min(page * perPage, feedbackData.meta.total)} of{" "}
                {feedbackData.meta.total} logs
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: feedbackData.meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    className="h-8 w-8 text-xs font-bold"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(p + 1, feedbackData.meta.totalPages))}
                  disabled={page === feedbackData.meta.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border border-border/80 text-center py-12">
          <CardContent className="space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h3 className="text-sm font-bold">Failed to load feedback logs</h3>
            <p className="text-xs text-muted-foreground">Please refresh the inbox workspace.</p>
          </CardContent>
        </Card>
      )}

      <CsvWizard
        isOpen={isCsvWizardOpen}
        onClose={() => setIsCsvWizardOpen(false)}
        onImportComplete={fetchFeedback}
      />

      <FeedbackModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingId(null); }}
        feedbackId={editingId}
        onSuccess={fetchFeedback}
      />
    </div>
  );
}
