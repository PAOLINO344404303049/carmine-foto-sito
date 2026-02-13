import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbdoocxztvxvqktkhoeb.supabase.co';
// Nota: questa chiave è stata fornita dall'utente come anon key per Supabase
const supabaseAnonKey = 'sb_publishable_QPNGoibFacVuOpWf1vNZsA_IkTvJRKf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);