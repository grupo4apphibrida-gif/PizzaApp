import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl) throw new Error("Supabase URL no encontrado. Define VITE_SUPABASE_URL en .env");
if (!supabaseKey) throw new Error("Supabase key no encontrada. Define VITE_SUPABASE_KEY en .env");

export const supabase = createClient(supabaseUrl, supabaseKey);