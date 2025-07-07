export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lancamento: {
        Row: {
          created_at: string
          dataLancamento: string | null
          horaFinal: string | null
          horaInicial: string | null
          id: string
          observacoes: number | null
          odometroFinal: number | null
          odometroInicial: number | null
          quilometragemPercorrida: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dataLancamento?: string | null
          horaFinal?: string | null
          horaInicial?: string | null
          id?: string
          observacoes?: number | null
          odometroFinal?: number | null
          odometroInicial?: number | null
          quilometragemPercorrida?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dataLancamento?: string | null
          horaFinal?: string | null
          horaInicial?: string | null
          id?: string
          observacoes?: number | null
          odometroFinal?: number | null
          odometroInicial?: number | null
          quilometragemPercorrida?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_recent_pro_subscribers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_recent_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      odometer_records: {
        Row: {
          ciclo: number | null
          created_at: string
          date: string
          id: string
          odometro_final: number | null
          odometro_inicial: number | null
          pair_id: string | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          ciclo?: number | null
          created_at?: string
          date: string
          id?: string
          odometro_final?: number | null
          odometro_inicial?: number | null
          pair_id?: string | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          ciclo?: number | null
          created_at?: string
          date?: string
          id?: string
          odometro_final?: number | null
          odometro_inicial?: number | null
          pair_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      pix_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          expires_at: string
          id: string
          paid_at: string | null
          status: string
          stripe_payment_intent_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          expires_at: string
          id?: string
          paid_at?: string | null
          status: string
          stripe_payment_intent_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          expires_at?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          fuel_consumption: number | null
          id: string
          name: string | null
          role: string | null
          updated_at: string
          vehicle_model: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          fuel_consumption?: number | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          fuel_consumption?: number | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          vehicle_model?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          created_at: string
          date: string
          fuel_type: string | null
          id: string
          observation: string | null
          price_per_liter: number | null
          subcategory: string | null
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          fuel_type?: string | null
          id?: string
          observation?: string | null
          price_per_liter?: number | null
          subcategory?: string | null
          type: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          fuel_type?: string | null
          id?: string
          observation?: string | null
          price_per_liter?: number | null
          subcategory?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          plan_type: string
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_type: string
          started_at?: string
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_hours_records: {
        Row: {
          created_at: string
          end_date_time: string
          id: string
          start_date_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date_time: string
          id?: string
          start_date_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date_time?: string
          id?: string
          start_date_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_conversion_funnel: {
        Row: {
          activated: number | null
          active_users_7_days: number | null
          pro_subscribers: number | null
          registered: number | null
          retained_pro: number | null
        }
        Relationships: []
      }
      admin_kpi_summary: {
        Row: {
          active_pro_users: number | null
          active_users_7_days: number | null
          canceled_this_month: number | null
          current_monthly_revenue: number | null
          next_month_revenue_forecast: number | null
          total_users: number | null
        }
        Relationships: []
      }
      admin_recent_pro_subscribers: {
        Row: {
          id: string | null
          name: string | null
          subscription_date: string | null
        }
        Relationships: []
      }
      admin_recent_users: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          registration_date: string | null
        }
        Relationships: []
      }
      admin_statistics: {
        Row: {
          active_subscribers: number | null
          active_users_7_days: number | null
          daily_active_users: number | null
          monthly_active_users: number | null
          new_users_30_days: number | null
          new_users_7_days: number | null
          total_users: number | null
        }
        Relationships: []
      }
      user_growth_chart: {
        Row: {
          date: string | null
          new_users: number | null
          total_users: number | null
        }
        Relationships: []
      }
      user_type_distribution: {
        Row: {
          count: number | null
          user_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_subscription_info: {
        Args: { user_id_param: string }
        Returns: {
          plan_type: string
          status: string
        }[]
      }
      grant_pro_access: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      remove_pro_access: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      search_users_with_subscription: {
        Args: { search_term: string }
        Returns: {
          id: string
          name: string
          email: string
          subscription_status: string
          plan_type: string
          expires_at: string
        }[]
      }
      set_user_pro_status: {
        Args: { target_user_id: string; grant_pro: boolean }
        Returns: undefined
      }
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
