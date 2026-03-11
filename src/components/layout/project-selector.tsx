"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { Project } from "@/lib/supabase/types";

export function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setProjects(data);
        const match = pathname.match(/\/dashboard\/(.+)/);
        if (match && data.find((p) => p.id === match[1])) {
          setSelected(match[1]);
        } else {
          setSelected(data[0].id);
        }
      }
    }
    load();
  }, [pathname]);

  function handleChange(value: string | null) {
    if (!value) return;
    setSelected(value);
    router.push(`/dashboard/${value}`);
  }

  if (projects.length === 0) return null;

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
