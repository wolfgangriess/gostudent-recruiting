export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          applied_at: string
          avatar_url: string | null
          created_at: string
          current_stage_id: string | null
          cv_drive_id: string | null
          cv_url: string | null
          email: string
          first_name: string
          id: string
          job_id: string
          last_name: string
          offered_salary: number | null
          phone: string
          rating: number
          scheduled_at: string | null
          source: string
          stage_changed_at: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string
          avatar_url?: string | null
          created_at?: string
          current_stage_id?: string | null
          cv_drive_id?: string | null
          cv_url?: string | null
          email: string
          first_name: string
          id?: string
          job_id: string
          last_name: string
          offered_salary?: number | null
          phone?: string
          rating?: number
          scheduled_at?: string | null
          source?: string
          stage_changed_at?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string
          avatar_url?: string | null
          created_at?: string
          current_stage_id?: string | null
          cv_drive_id?: string | null
          cv_url?: string | null
          email?: string
          first_name?: string
          id?: string
          job_id?: string
          last_name?: string
          offered_salary?: number | null
          phone?: string
          rating?: number
          scheduled_at?: string | null
          source?: string
          stage_changed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          connected_email: string | null
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_email?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_email?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_attendees: {
        Row: {
          created_at: string
          id: string
          interview_id: string
          user_email: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id: string
          user_email: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string
          user_email?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_attendees_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          created_by_id: string | null
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          job_id: string
          location: string | null
          meeting_link: string | null
          stage_id: string
          start_time: string
          status: Database["public"]["Enums"]["interview_status"]
          title: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          job_id: string
          location?: string | null
          meeting_link?: string | null
          stage_id: string
          start_time: string
          status?: Database["public"]["Enums"]["interview_status"]
          title: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          job_id?: string
          location?: string | null
          meeting_link?: string | null
          stage_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["interview_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          cost_center: string | null
          created_at: string
          department: string
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          external_name: string | null
          hiring_manager: string | null
          hiring_team_ids: string[]
          id: string
          job_description_link: string | null
          level: string | null
          location: string
          name: string
          number_of_openings: number
          office: string | null
          recruiters: string[]
          reports_to: string | null
          requirements: string
          requisition_id: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          visibility_ids: string[]
          work_schedule: string | null
          worker_type: Database["public"]["Enums"]["worker_type"]
          workplace_type: Database["public"]["Enums"]["workplace_type"]
        }
        Insert: {
          cost_center?: string | null
          created_at?: string
          department: string
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          external_name?: string | null
          hiring_manager?: string | null
          hiring_team_ids?: string[]
          id?: string
          job_description_link?: string | null
          level?: string | null
          location?: string
          name: string
          number_of_openings?: number
          office?: string | null
          recruiters?: string[]
          reports_to?: string | null
          requirements?: string
          requisition_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          visibility_ids?: string[]
          work_schedule?: string | null
          worker_type?: Database["public"]["Enums"]["worker_type"]
          workplace_type?: Database["public"]["Enums"]["workplace_type"]
        }
        Update: {
          cost_center?: string | null
          created_at?: string
          department?: string
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          external_name?: string | null
          hiring_manager?: string | null
          hiring_team_ids?: string[]
          id?: string
          job_description_link?: string | null
          level?: string | null
          location?: string
          name?: string
          number_of_openings?: number
          office?: string | null
          recruiters?: string[]
          reports_to?: string | null
          requirements?: string
          requisition_id?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          visibility_ids?: string[]
          work_schedule?: string | null
          worker_type?: Database["public"]["Enums"]["worker_type"]
          workplace_type?: Database["public"]["Enums"]["workplace_type"]
        }
        Relationships: []
      }
      offers: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string | null
          id: string
          job_id: string
          notes: string | null
          offered_salary: number
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id: string
          notes?: string | null
          offered_salary: number
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          offered_salary?: number
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string
          id: string
          job_id: string
          name: string
          order: number
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          name: string
          order?: number
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          name?: string
          order?: number
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scorecard_evaluations: {
        Row: {
          candidate_id: string
          completed_at: string
          created_at: string
          evaluator_id: string | null
          feedback: string
          id: string
          scores: Json
          stage_id: string
        }
        Insert: {
          candidate_id: string
          completed_at?: string
          created_at?: string
          evaluator_id?: string | null
          feedback?: string
          id?: string
          scores?: Json
          stage_id: string
        }
        Update: {
          candidate_id?: string
          completed_at?: string
          created_at?: string
          evaluator_id?: string | null
          feedback?: string
          id?: string
          scores?: Json
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecard_evaluations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_templates: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          stage_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          id?: string
          stage_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_templates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: true
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "hiring_manager" | "employee"
      employment_type: "full-time" | "part-time" | "contract" | "internship"
      interview_status: "scheduled" | "completed" | "cancelled"
      job_status: "open" | "closed" | "draft"
      offer_status: "pending" | "approved" | "rejected"
      worker_type:
        | "regular"
        | "internship_trainee"
        | "fixed_term"
        | "freelancer"
      workplace_type: "onsite" | "remote" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "recruiter", "hiring_manager", "employee"],
      employment_type: ["full-time", "part-time", "contract", "internship"],
      interview_status: ["scheduled", "completed", "cancelled"],
      job_status: ["open", "closed", "draft"],
      offer_status: ["pending", "approved", "rejected"],
      worker_type: [
        "regular",
        "internship_trainee",
        "fixed_term",
        "freelancer",
      ],
      workplace_type: ["onsite", "remote", "hybrid"],
    },
  },
} as const
