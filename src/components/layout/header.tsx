"use client";

import Link from "next/link";
import { Activity, FolderOpen } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ProjectSelector } from "./project-selector";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5 text-chart-1" />
          <span>Polso</span>
        </Link>

        <div className="ml-6 flex-1">
          <ProjectSelector />
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <FolderOpen className="h-4 w-4" />
            Projects
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
