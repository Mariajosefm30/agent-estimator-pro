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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assumptions: {
        Row: {
          agent_p3_tiers: Json
          avg_actions_per_query: number
          copilot_credit_usd: number
          created_at: string
          credits_per_action: number
          credits_per_flow_run: number
          credits_per_trigger_run: number
          generative_answer_credits: number
          id: string
          non_tenant_grounding_credits: number
          prompt_basic_per_10: number
          prompt_premium_per_10: number
          prompt_standard_per_10: number
          ptu_usd_per_hour: number
          tenant_graph_grounding_credits: number
          updated_at: string
          use_api_pricing: boolean
        }
        Insert: {
          agent_p3_tiers?: Json
          avg_actions_per_query?: number
          copilot_credit_usd?: number
          created_at?: string
          credits_per_action?: number
          credits_per_flow_run?: number
          credits_per_trigger_run?: number
          generative_answer_credits?: number
          id?: string
          non_tenant_grounding_credits?: number
          prompt_basic_per_10?: number
          prompt_premium_per_10?: number
          prompt_standard_per_10?: number
          ptu_usd_per_hour?: number
          tenant_graph_grounding_credits?: number
          updated_at?: string
          use_api_pricing?: boolean
        }
        Update: {
          agent_p3_tiers?: Json
          avg_actions_per_query?: number
          copilot_credit_usd?: number
          created_at?: string
          credits_per_action?: number
          credits_per_flow_run?: number
          credits_per_trigger_run?: number
          generative_answer_credits?: number
          id?: string
          non_tenant_grounding_credits?: number
          prompt_basic_per_10?: number
          prompt_premium_per_10?: number
          prompt_standard_per_10?: number
          ptu_usd_per_hour?: number
          tenant_graph_grounding_credits?: number
          updated_at?: string
          use_api_pricing?: boolean
        }
        Relationships: []
      }
      retail_prices_cache: {
        Row: {
          id: string
          last_updated: string
          meter_name: string
          product_name: string
          raw_data: Json | null
          region: string
          service_name: string
          sku_name: string
          unit_of_measure: string
          unit_price: number
        }
        Insert: {
          id?: string
          last_updated?: string
          meter_name: string
          product_name: string
          raw_data?: Json | null
          region: string
          service_name: string
          sku_name: string
          unit_of_measure: string
          unit_price: number
        }
        Update: {
          id?: string
          last_updated?: string
          meter_name?: string
          product_name?: string
          raw_data?: Json | null
          region?: string
          service_name?: string
          sku_name?: string
          unit_of_measure?: string
          unit_price?: number
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          outputs: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          outputs?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          outputs?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
