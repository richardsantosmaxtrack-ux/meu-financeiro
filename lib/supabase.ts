import { createClient } from '@supabase/supabase-js';

// Colocando os dados direto aqui para o sistema não ter como errar
const supabaseUrl = 'https://qggirnlpyobmhjlzucnd.supabase.co';
const supabaseAnonKey = 'sb_publishable_1Bfpv8YWZYFtfARB6rnj2g_YqxymIkV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);