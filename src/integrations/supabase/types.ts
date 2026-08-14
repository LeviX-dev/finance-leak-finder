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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      erp_connections: {
        Row: {
          account_name: string | null
          created_at: string
          credentials_ciphertext: string | null
          external_account_id: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          metadata: Json
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          credentials_ciphertext?: string | null
          external_account_id?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          created_at?: string
          credentials_ciphertext?: string | null
          external_account_id?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      erp_contracts: {
        Row: {
          connection_id: string
          created_at: string
          currency: string | null
          end_date: string | null
          external_id: string
          id: string
          name: string | null
          raw: Json
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          value: number | null
          vendor_name: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          currency?: string | null
          end_date?: string | null
          external_id: string
          id?: string
          name?: string | null
          raw?: Json
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
          vendor_name?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          currency?: string | null
          end_date?: string | null
          external_id?: string
          id?: string
          name?: string | null
          raw?: Json
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_contracts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_invoices: {
        Row: {
          amount: number | null
          amount_paid: number | null
          connection_id: string
          created_at: string
          currency: string | null
          due_date: string | null
          external_id: string
          id: string
          invoice_number: string | null
          issue_date: string | null
          raw: Json
          status: string | null
          tax_amount: number | null
          type: string | null
          updated_at: string
          user_id: string
          vendor_external_id: string | null
          vendor_name: string | null
        }
        Insert: {
          amount?: number | null
          amount_paid?: number | null
          connection_id: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          external_id: string
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          raw?: Json
          status?: string | null
          tax_amount?: number | null
          type?: string | null
          updated_at?: string
          user_id: string
          vendor_external_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number | null
          amount_paid?: number | null
          connection_id?: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          external_id?: string
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          raw?: Json
          status?: string | null
          tax_amount?: number | null
          type?: string | null
          updated_at?: string
          user_id?: string
          vendor_external_id?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_invoices_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_oauth_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          provider: string
          redirect_to: string | null
          state: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string
          provider: string
          redirect_to?: string | null
          state: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          provider?: string
          redirect_to?: string | null
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      erp_payments: {
        Row: {
          amount: number | null
          connection_id: string
          created_at: string
          currency: string | null
          external_id: string
          id: string
          invoice_external_id: string | null
          method: string | null
          paid_date: string | null
          raw: Json
          reference: string | null
          status: string | null
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount?: number | null
          connection_id: string
          created_at?: string
          currency?: string | null
          external_id: string
          id?: string
          invoice_external_id?: string | null
          method?: string | null
          paid_date?: string | null
          raw?: Json
          reference?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number | null
          connection_id?: string
          created_at?: string
          currency?: string | null
          external_id?: string
          id?: string
          invoice_external_id?: string | null
          method?: string | null
          paid_date?: string | null
          raw?: Json
          reference?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_payments_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_provider_config: {
        Row: {
          client_id: string
          client_secret_ciphertext: string
          configured_by: string | null
          created_at: string
          extra_config: Json
          provider: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_secret_ciphertext: string
          configured_by?: string | null
          created_at?: string
          extra_config?: Json
          provider: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_secret_ciphertext?: string
          configured_by?: string | null
          created_at?: string
          extra_config?: Json
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      erp_sync_runs: {
        Row: {
          connection_id: string
          contracts_synced: number
          error: string | null
          finished_at: string | null
          id: string
          invoices_synced: number
          payments_synced: number
          started_at: string
          status: string
          user_id: string
          vendors_synced: number
        }
        Insert: {
          connection_id: string
          contracts_synced?: number
          error?: string | null
          finished_at?: string | null
          id?: string
          invoices_synced?: number
          payments_synced?: number
          started_at?: string
          status?: string
          user_id: string
          vendors_synced?: number
        }
        Update: {
          connection_id?: string
          contracts_synced?: number
          error?: string | null
          finished_at?: string | null
          id?: string
          invoices_synced?: number
          payments_synced?: number
          started_at?: string
          status?: string
          user_id?: string
          vendors_synced?: number
        }
        Relationships: [
          {
            foreignKeyName: "erp_sync_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_vendors: {
        Row: {
          connection_id: string
          created_at: string
          email: string | null
          external_id: string
          id: string
          name: string
          phone: string | null
          raw: Json
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          email?: string | null
          external_id: string
          id?: string
          name: string
          phone?: string | null
          raw?: Json
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          email?: string | null
          external_id?: string
          id?: string
          name?: string
          phone?: string | null
          raw?: Json
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_vendors_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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
