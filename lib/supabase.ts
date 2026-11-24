import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jolcqqwvzrvqydzxpwij.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RqH3EahZbSjwmv-Hay-uRQ_IiZ6dgfa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
