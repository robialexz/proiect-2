/**
 * Client Supabase
 * Acest fișier conține configurația și clientul Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { APP_CONSTANTS } from '@/lib/constants';

// Obținem URL-ul și cheia Supabase din constante
const supabaseUrl = APP_CONSTANTS.SUPABASE_URL;
const supabaseKey = APP_CONSTANTS.SUPABASE_KEY;

// Verificăm dacă URL-ul și cheia sunt definite
if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined');
}

if (!supabaseKey) {
  throw new Error('Supabase key is not defined');
}

// Opțiunile pentru clientul Supabase
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': APP_CONSTANTS.APP_NAME,
      'x-application-version': APP_CONSTANTS.APP_VERSION,
    },
  },
};

// Creăm clientul Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, options);

// Exportăm clientul Supabase
export default supabase;
