"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";

import { ProjectMark } from "@/components/layout/project-mark";
import { SidebarContent } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Navbar() {
  const [navigationOpen, setNavigationOpen] = React.useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <header className="bg-background/88 supports-[backdrop-filter]:bg-background/72 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
        <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-4" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
            </TooltipTrigger>
            <TooltipContent>Navigation</TooltipContent>
          </Tooltip>
          <SheetContent side="left" className="w-80 p-0">
            <SheetTitle className="sr-only">Project LOOP navigation</SheetTitle>
            <SidebarContent onNavigate={() => setNavigationOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="lg:hidden">
          <ProjectMark compact />
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="text-sm font-medium">AI Customer Feedback Intelligence Platform</p>
          <p className="text-xs text-muted-foreground">Phase 1 foundation</p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled>
                <Search className="size-4" />
                <span className="sr-only">Search unavailable</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search pending</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <Bell className="size-4" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback>PL</AvatarFallback>
                </Avatar>
                <span className="sr-only">Open account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Project LOOP</p>
                  <p className="text-xs text-muted-foreground">Auth shell configured</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
