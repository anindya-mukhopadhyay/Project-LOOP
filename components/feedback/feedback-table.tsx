"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, MessageSquare, Edit2, Trash, Eye, ExternalLink } from "lucide-react";
import type { Feedback } from "@prisma/client";
import type { ComponentProps } from "react";

interface FeedbackTableProps {
  items: (Feedback & { feedbackTheme?: { theme: { name: string } }[] })[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onSortChange: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  userRole: string;
}

export function FeedbackTable({
  items,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onSortChange,
  onEditClick,
  onDeleteClick,
  userRole,
}: FeedbackTableProps) {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isViewer = userRole === "VIEWER";

  const getChannelLabel = (channel: string) => {
    return channel === "SOCIAL" ? "SOCIAL_MEDIA" : channel;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "NEGATIVE":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIONED":
        return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
      case "REVIEWED":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      default:
        return "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20";
    }
  };

  return (
    <div className="overflow-hidden border border-border/60 rounded-xl bg-card/30 backdrop-blur-md shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border/60">
              <th className="p-3 w-[50px] text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAllToggle}
                  aria-label="Select all rows"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/45 accent-primary cursor-pointer"
                />
              </th>
              
              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider">
                <button
                  type="button"
                  onClick={() => onSortChange("channel")}
                  className="flex items-center gap-1 hover:text-foreground transition duration-150"
                >
                  Channel
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>

              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider w-[45%]">
                Feedback Content
              </th>

              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider">
                <button
                  type="button"
                  onClick={() => onSortChange("status")}
                  className="flex items-center gap-1 hover:text-foreground transition duration-150"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>

              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider">
                Sentiment
              </th>

              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider">
                Theme / Tag
              </th>

              <th className="p-3 font-semibold text-xs text-muted-foreground tracking-wider">
                <button
                  type="button"
                  onClick={() => onSortChange("createdAt")}
                  className="flex items-center gap-1 hover:text-foreground transition duration-150"
                >
                  Received
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>

              <th className="p-3 w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <MessageSquare className="h-8 w-8 text-muted" />
                    <p className="font-semibold text-sm">No feedback logs found</p>
                    <p className="text-xs max-w-xs">
                      Try adjusting search terms, filters, or import fresh logs.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const themeName =
                  item.feedbackTheme && item.feedbackTheme[0]?.theme?.name
                    ? item.feedbackTheme[0].theme.name
                    : null;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/10 border-b border-border/40 transition duration-150 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(item.id)}
                        aria-label={`Select row ${item.title}`}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary/45 accent-primary cursor-pointer"
                      />
                    </td>

                    <td className="p-3 font-medium text-xs">
                      <Badge variant="outline" className="border-border bg-card/60">
                        {getChannelLabel(item.channel)}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <div className="space-y-1">
                        <Link
                          href={`/feedback/${item.id}` as ComponentProps<typeof Link>["href"]}
                          className="font-semibold text-foreground hover:text-primary transition duration-150 flex items-center gap-1"
                        >
                          {item.title}
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 pr-4">{item.body}</p>
                        {item.customerName && (
                          <div className="text-[10px] text-muted-foreground/80 font-medium">
                            Customer: {item.customerName} {item.customerEmail ? `(${item.customerEmail})` : ""}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <Badge className={getSentimentColor(item.sentiment)}>
                        {item.sentiment}
                      </Badge>
                    </td>

                    <td className="p-3 text-xs font-semibold text-muted-foreground">
                      {themeName ? (
                        <Badge variant="outline" className="border-teal-500/20 text-teal-500 bg-teal-500/5">
                          {themeName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Unclassified</span>
                      )}
                    </td>

                    <td className="p-3 text-xs text-muted-foreground font-semibold">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border border-border/80">
                          <DropdownMenuItem asChild>
                            <Link href={`/feedback/${item.id}` as ComponentProps<typeof Link>["href"]} className="cursor-pointer flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onEditClick(item.id)}
                            disabled={isViewer}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit Log
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDeleteClick(item.id)}
                            disabled={isViewer}
                            className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                          >
                            <Trash className="h-4 w-4 text-destructive/80" /> Delete Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
