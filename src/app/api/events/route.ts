import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Validate API key and get project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();

  // Support single event or array of events
  const events = Array.isArray(body) ? body : [body];

  const inserts = events.map((e) => ({
    project_id: project.id,
    channel: e.channel || "default",
    title: e.title,
    description: e.description || null,
    tags: e.tags || [],
    metadata: e.metadata || {},
    icon: e.icon || null,
    importance: e.importance || "normal",
  }));

  // Validate all events have a title
  for (const ins of inserts) {
    if (!ins.title || typeof ins.title !== "string") {
      return NextResponse.json(
        { error: "Each event must have a title" },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("events")
    .insert(inserts)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { inserted: data.length, events: data },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");
  const channel = searchParams.get("channel");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const favoritesOnly = searchParams.get("favorites") === "true";

  if (!projectId) {
    return NextResponse.json(
      { error: "project_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (channel) {
    query = query.eq("channel", channel);
  }

  if (favoritesOnly) {
    query = query.eq("favorited", true);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    events: data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
