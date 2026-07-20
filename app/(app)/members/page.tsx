"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  MoreHorizontal,
  Ban,
  Trash2,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserX,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { User, Role, Invitation } from "@prisma/client";
import type { PaginatedMembers } from "@/services/member.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MembersPage() {
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Members data & filters
  const [membersData, setMembersData] = useState<PaginatedMembers | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Invitations data & form
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/workspace");
      const json = await res.json();
      if (res.ok && json.success) {
        const activeRes = await fetch(`/api/members?perPage=100`);
        const activeJson = await activeRes.json();
        if (activeRes.ok && activeJson.success) {
          const list = activeJson.data.members as User[];
          const me = list.find((u) => u.role === json.data.currentUserRole);
          if (me) setCurrentUser(me);
        }
      }
    } catch {
      // Ignored
    }
  };

  const fetchMembers = async (silent = false) => {
    if (!silent) setLoadingMembers(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        perPage: "7",
        sortBy,
        sortOrder,
      });

      if (searchQuery.trim()) {
        queryParams.append("query", searchQuery.trim());
      }
      if (roleFilter !== "ALL") {
        queryParams.append("role", roleFilter);
      }

      const res = await fetch(`/api/members?${queryParams.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load members.");
      }
      setMembersData(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchInvitations = async (silent = false) => {
    if (!silent) setLoadingInvites(true);
    try {
      const res = await fetch("/api/invitations");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load invitations.");
      }
      setInvitations(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load invitations.");
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchInvitations();
  }, []);


  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder, roleFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchMembers(true);
    }, 300);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to send invitation.");
      }
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      fetchInvitations(true);
      fetchMembers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to cancel invitation.");
      }
      toast.success("Invitation canceled successfully.");
      fetchInvitations(true);
      fetchMembers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel invitation.");
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}/resend`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to resend invitation.");
      }
      toast.success("Invitation resent successfully!");
      fetchInvitations(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend invitation.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update role.");
      }
      toast.success("Member role updated successfully.");
      fetchMembers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update member role.");
    }
  };

  const handleToggleSuspension = async (userId: string) => {
    try {
      const res = await fetch(`/api/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleSuspension: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to toggle suspension state.");
      }
      const isSuspended = (json.data.metadata as Record<string, unknown>)?.suspended;
      toast.success(`Member has been ${isSuspended ? "suspended" : "activated"} successfully.`);
      fetchMembers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change suspension state.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/members/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to remove member.");
      }
      toast.success("Member removed from workspace.");
      fetchMembers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member.");
    }
  };

  const toggleSort = (field: "name" | "email" | "role" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const calculateDaysLeft = (expiresAtStr: string) => {
    const expiresAt = new Date(expiresAtStr);
    const diffTime = expiresAt.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your workspace roles, active users, and invitations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchMembers();
            fetchInvitations();
          }}
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Members Table Card */}
        <Card className="lg:col-span-2 shadow-sm border border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Active Members
            </CardTitle>
            <CardDescription>All users who currently have access to this workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="ANALYST">Analysts</option>
                  <option value="VIEWER">Viewers</option>
                </select>
              </div>
            </div>

            {/* TanStack-style Members Table */}
            <div className="rounded-md border overflow-x-auto bg-card/50">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs font-semibold text-muted-foreground select-none">
                    <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("name")}>
                      <div className="flex items-center gap-1">
                        Member
                        <ArrowUpDown className="size-3" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("role")}>
                      <div className="flex items-center gap-1">
                        Role
                        <ArrowUpDown className="size-3" />
                      </div>
                    </th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMembers ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-36" />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="p-3 text-right">
                          <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                        </td>
                      </tr>
                    ))
                  ) : !membersData || membersData.members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No team members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    membersData.members.map((member) => {
                      const meta = (member.metadata as Record<string, unknown>) || {};
                      const isSuspended = Boolean(meta.suspended);
                      const isMe = currentUser?.id === member.id;

                      return (
                        <tr key={member.id} className="border-b last:border-0 hover:bg-muted/10">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                  {(member.name || member.email)
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-foreground flex items-center gap-1">
                                  {member.name || "Pending Signup"}
                                  {isMe && <Badge className="text-[9px] h-4 px-1" variant="outline">You</Badge>}
                                </div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={member.role === "ADMIN" ? "default" : "secondary"} className="text-xs font-medium">
                              {member.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {isSuspended ? (
                              <Badge variant="outline" className="gap-1 px-1.5 h-5 text-[10px] uppercase font-semibold text-red-500 border-red-500/25 bg-red-500/5">
                                <Ban className="size-3" />
                                Suspended
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 px-1.5 h-5 text-[10px] uppercase font-semibold text-emerald-500 border-emerald-500/25 bg-emerald-500/5">
                                <CheckCircle className="size-3" />
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isAdmin ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {/* Role Management (Admins only) */}
                                  <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1">
                                    Change Role
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, "ADMIN")}
                                    disabled={isMe || member.role === "ADMIN"}
                                  >
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, "ANALYST")}
                                    disabled={isMe || member.role === "ANALYST"}
                                  >
                                    Make Analyst
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, "VIEWER")}
                                    disabled={isMe || member.role === "VIEWER"}
                                  >
                                    Make Viewer
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />

                                  {/* Suspension */}
                                  <DropdownMenuItem onClick={() => handleToggleSuspension(member.id)} disabled={isMe}>
                                    <Ban className="size-4 mr-2 text-yellow-600" />
                                    {isSuspended ? "Activate User" : "Suspend User"}
                                  </DropdownMenuItem>

                                  {/* Delete */}
                                  <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} disabled={isMe} className="text-destructive focus:bg-destructive/5">
                                    <Trash2 className="size-4 mr-2" />
                                    Remove User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {membersData && membersData.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  Page {membersData.page} of {membersData.totalPages} ({membersData.total} members total)
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.min(membersData.totalPages, p + 1))}
                    disabled={page === membersData.totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Invite & Pending Invites */}
        <div className="space-y-6">
          {/* Invite Member Card (Only visible to Admin) */}
          {isAdmin && (
            <Card className="shadow-sm border border-border/80 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="size-4 text-muted-foreground" />
                  Invite New Member
                </CardTitle>
                <CardDescription>Grant new users access to this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="name@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Select Role</Label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as Role)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="VIEWER">Viewer (Read-only)</option>
                      <option value="ANALYST">Analyst (Write feedback, read reports)</option>
                      <option value="ADMIN">Admin (Full access & settings)</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full gap-1.5" disabled={inviting}>
                    {inviting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending Invite...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Pending Invitations Card */}
          <Card className="shadow-sm border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                Pending Invitations
              </CardTitle>
              <CardDescription>Sent invites that are still awaiting registration</CardDescription>
            </CardHeader>
            <CardContent className="px-3">
              {loadingInvites ? (
                <div className="space-y-3 px-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No pending invitations.
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-col gap-2 rounded-lg border bg-background/40 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <p className="font-semibold truncate max-w-[170px]" title={invite.email}>
                            {invite.email}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 uppercase font-semibold">
                              {invite.role}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="size-3" />
                              {calculateDaysLeft(invite.expiresAt.toString())}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleResendInvite(invite.id)}
                              title="Resend Invitation (resets expiry)"
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelInvite(invite.id)}
                              title="Revoke/Cancel Invitation"
                            >
                              <UserX className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
