import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qseslzjhrufikcxwzvmk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SIhilZKB1c5o5851ZV0rHQ_IovqvKvT';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
