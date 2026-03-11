"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirect() {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        router.replace(`/dashboard/${data[0].id}`);
      } else {
        router.replace("/projects");
      }
      setLoading(false);
    }
    redirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
}
