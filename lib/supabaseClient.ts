
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbdoocxztvxvqktkhoeb.supabase.co';
const supabaseAnonKey = 'sb_publishable_QPNGoibFacVuOpWf1vNZsA_IkTvJRKf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
