import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json(
      { error: "project_id is required" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const events = body.events;

  if (!Array.isArray(events)) {
    return NextResponse.json(
      { error: "events array is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const inserts = events.map((e: Record<string, unknown>) => ({
    project_id: projectId,
    channel: (e.channel as string) || "default",
    title: e.title as string,
    description: (e.description as string) || null,
    tags: (e.tags as string[]) || [],
    metadata: (e.metadata as Record<string, unknown>) || {},
    icon: (e.icon as string) || null,
    importance: (e.importance as string) || "normal",
    favorited: (e.favorited as boolean) || false,
    created_at: (e.created_at as string) || new Date().toISOString(),
  }));

  const { data, error } = await supabase.from("events").insert(inserts).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: data.length }, { status: 201 });
}
