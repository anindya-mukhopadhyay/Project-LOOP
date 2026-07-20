"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

import { navigationSections, productSignals } from "@/components/navigation/app-navigation";
import { ProjectMark } from "@/components/layout/project-mark";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WORKSPACE_DISPLAY_FALLBACK } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

type SidebarContentProps = {
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <ProjectMark />
      </div>
      <Separator />
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navigationSections.map((section) => (
          <nav key={section.title} className="space-y-2">
            <p className="px-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...(onNavigate ? { onClick: onNavigate } : {})}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent text-accent-foreground shadow-sm",
                    )}
                  >
                    <item.icon
                      className={cn("size-4", active ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {item.badge ? <Badge variant="muted">{item.badge}</Badge> : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="rounded-lg border bg-background/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{WORKSPACE_DISPLAY_FALLBACK}</p>
              <p className="text-xs text-muted-foreground">Tenant foundation</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {productSignals.map((signal) => (
              <div key={signal.label} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{signal.label}</span>
                <span className="font-medium text-foreground">{signal.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <SidebarContent />
    </aside>
  );
}
