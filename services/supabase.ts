
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thiyeerwwhwarekudhyg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
