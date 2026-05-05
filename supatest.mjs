import { createClient } from "@supabase/supabase-js";
const url = 'https://ahzvhgjxdxiyfzzpspdk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubmEiLCJpYXQiOjE3NzMyNTgwNjksImV4cCI6MjA4ODgzNDA2OX0.-Ck1RLldWdOobfTDdRhJqxlSx6MQ-Rd4UGC5wLTlaaQ';
const supabase = createClient(url, key);

(async () => {
  const tables = ['usuarios','Usuarios','ingredientes','Ingredientes','promociones','Promociones'];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(1);
      console.log(t, { error: error ? error.message : null, data: data ? data.length : 0 });
    } catch (e) {
      console.log(t, 'EX:', e.message);
    }
  }
})();
