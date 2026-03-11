export interface Project {
  id: string;
  name: string;
  description: string | null;
  api_key: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  project_id: string;
  channel: string;
  title: string;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  icon: string | null;
  importance: "low" | "normal" | "high" | "critical";
  favorited: boolean;
  created_at: string;
}

export interface EventInsert {
  project_id: string;
  channel: string;
  title: string;
  description?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
  icon?: string | null;
  importance?: "low" | "normal" | "high" | "critical";
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "api_key" | "created_at">;
        Update: Partial<Omit<Project, "id" | "api_key" | "created_at">>;
      };
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: Partial<EventRow>;
      };
    };
  };
}
