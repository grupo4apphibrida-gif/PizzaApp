import { createClient } from "@supabase/supabase-js";
const url = 'https://gyunsyqzzvmalokhwbxx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dW5zeXF6enZtYWxva2h3Ynh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjUzMzYsImV4cCI6MjA4OTYwMTMzNn0.K4JAjTW-9qxBw0iCBX0KNztxuoAdJHRz07gJ4yzis2c';
const supabase = createClient(url, key);

(async () => {
  try {
    const { data: dataPerm, error: errPerm } = await supabase.from('permisos').select('*');
    if (errPerm) {
      console.log('Error permisos:', errPerm.message);
    } else {
      console.log('Permisos data:', JSON.stringify(dataPerm, null, 2));
    }
  } catch (e) {
    console.log('EX:', e.message);
  }
})();
