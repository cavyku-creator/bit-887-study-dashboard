import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl as string, supabaseKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return browserClient;
}
