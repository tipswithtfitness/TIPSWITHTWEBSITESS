import { createClient } from "@supabase/supabase-js";

// This is the safe browser Supabase client.
// It only uses public environment variables.
// Do not put SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY in this file.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);