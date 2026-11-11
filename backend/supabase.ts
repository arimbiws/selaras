import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const configured =
  Boolean(url && key) &&
  !url!.includes("url_supabase") &&
  !key!.includes("sb_publishable_code") &&
  !url!.includes("YOUR_PROJECT") &&
  !key!.includes("YOUR_SUPABASE");

export const supabaseConfigured = configured;

export const supabaseServer = configured
  ? createClient(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "selaras-next-server" } },
    })
  : null;
