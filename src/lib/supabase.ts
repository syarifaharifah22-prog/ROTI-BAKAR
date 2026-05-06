/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan createClient hanya dipanggil jika datanya benar-benar valid
// Jika tidak, kita buat client dummy agar tidak crash saat di-import
const createSafeClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || supabaseUrl === '') {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Supabase initialization failed:', e);
    return null;
  }
};

export const supabase = createSafeClient();
