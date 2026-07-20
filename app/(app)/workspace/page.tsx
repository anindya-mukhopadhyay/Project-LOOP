"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  HardDrive,
  BrainCircuit,
  MessageSquare,
  Users,
  Mail,
  Calendar,
  ExternalLink,
  Shield,
  History,
  Settings,
  LayoutDashboard,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { WorkspaceDashboardData } from "@/services/workspace.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [data, setData] = useState<WorkspaceDashboardData | null>(null);

  // Settings form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formDomain, setFormDomain] = useState("");

  const fetchWorkspaceData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/workspace");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load workspace data.");
      }
      setData(json.data);
      setFormName(json.data.workspace.name);
      setFormDescription(json.data.workspace.description || "");
      setFormLogoUrl(json.data.workspace.logoUrl || "");
      setFormDomain(json.data.workspace.domain || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Workspace name is required.");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          logoUrl: formLogoUrl || null,
          domain: formDomain || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update settings.");
      }
      toast.success("Workspace settings updated successfully!");
      // Silent refresh to fetch updated data
      await fetchWorkspaceData(true);
      setActiveTab("overview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update workspace settings.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 col-span-1" />
          <Skeleton className="h-32 col-span-1" />
          <Skeleton className="h-32 col-span-1" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="space-y-4 md:col-span-1">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Workspace not loaded</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load your workspace information. Please try again.
        </p>
        <Button onClick={() => fetchWorkspaceData()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { workspace, currentUserRole, owner, counts, timeline } = data;
  const isAdmin = currentUserRole === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-lg border-2 border-primary/20 bg-background/50 p-0.5 shadow-md">
            <AvatarImage src={workspace.logoUrl || undefined} className="rounded-lg object-contain" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-xl font-bold text-primary">
              {workspace.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{workspace.name}</h1>
              <Badge variant="outline" className="capitalize text-xs font-semibold px-2 py-0.5">
                {workspace.plan} Plan
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Slug: <span className="font-mono text-xs">{workspace.slug}</span>
              {workspace.domain && (
                <>
                  <span className="mx-2">•</span>
                  Domain: <span className="font-mono text-xs">{workspace.domain}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="gap-2"
          >
            <LayoutDashboard className="size-4" />
            Overview
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === "settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="gap-2"
            >
              <Settings className="size-4" />
              Settings
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => fetchWorkspaceData(true)} title="Refresh data">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* KPI Dashboard Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Members
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.members}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Mail className="size-3" />
                  {counts.pendingInvitations} Pending invites
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Feedback Items
                </CardTitle>
                <MessageSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.feedbackPlaceholder}</div>
                <p className="text-xs text-muted-foreground mt-1">AI Classification active</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Credits
                </CardTitle>
                <BrainCircuit className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.aiCreditsPlaceholder} / 1000</div>
                <p className="text-xs text-muted-foreground mt-1">Resets in 14 days</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Storage Used
                </CardTitle>
                <HardDrive className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.storageUsedPlaceholder} MB / 100 MB</div>
                <p className="text-xs text-muted-foreground mt-1">12.4% capacity used</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Details Card */}
            <div className="space-y-6 md:col-span-1">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Workspace Details</CardTitle>
                  <CardDescription>General workspace specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workspace.description && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                      <p className="text-sm text-foreground">{workspace.description}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Plan & Status</Label>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Active (Starter Plan)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Created</Label>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <Calendar className="size-4 text-muted-foreground" />
                      {new Date(workspace.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {owner && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Owner</Label>
                      <div className="text-sm">
                        <span className="font-semibold text-foreground">{owner.name || "Administrator"}</span>
                        <span className="block text-xs text-muted-foreground">{owner.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Your Role</Label>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <Shield className="size-4 text-primary" />
                      <span className="font-semibold uppercase text-primary/95 text-xs">{currentUserRole}</span>
                    </p>
                  </div>

                  {workspace.domain && (
                    <div className="space-y-1 pt-2 border-t">
                      <a
                        href={`https://${workspace.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        Visit Workspace Website
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Timeline / Audit logs */}
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    Activity Timeline
                  </CardTitle>
                  <CardDescription>Audit history for recent workspace events</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No recent activities recorded in this workspace.
                    </div>
                  ) : (
                    <div className="relative border-l pl-4 space-y-6">
                      {timeline.map((log) => {
                        const actorName = log.actor?.name || log.actor?.email || "System";
                        return (
                          <div key={log.id} className="relative space-y-1">
                            <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border border-background bg-primary" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground/90">{actorName}</span>
                              <span>
                                {new Date(log.createdAt).toLocaleDateString()} at{" "}
                                {new Date(log.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80">{log.summary}</p>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                                {log.action.toLowerCase()}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {log.entityType}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Tab (Only visible to Admin) */
        <Card className="max-w-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Modify workspace configuration parameters and metadata.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input
                  id="ws-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter workspace name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ws-desc">Description</Label>
                <textarea
                  id="ws-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tell us about this workspace"
                  maxLength={500}
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ws-logo">Logo URL</Label>
                <Input
                  id="ws-logo"
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a web address pointing directly to a PNG or JPG logo image.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ws-domain">Domain Scoping</Label>
                <Input
                  id="ws-domain"
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  placeholder="workspace.acme.com"
                />
                <p className="text-xs text-muted-foreground">
                  Used for email match validations or routing.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
