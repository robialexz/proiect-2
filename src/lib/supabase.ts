/**
 * IMPORTANT: Pentru a evita crearea mai multor instanțe GoTrueClient,
 * acest fișier doar re-exportă clientul Supabase din services/api/supabase-client.ts
 *
 * Acest fișier există doar pentru compatibilitate cu codul existent care importă din lib/supabase
 */

import { supabase } from "../services/api/supabase-client";

export { supabase };

// Auth state changes will be handled directly in the AuthContext.
