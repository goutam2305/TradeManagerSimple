
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odwczsfjbfgduxzwvhbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd2N6c2ZqYmZnZHV4end2aGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDg5MTksImV4cCI6MjA4NjQ4NDkxOX0.HH1alkJUqXujqYTZdf7zlJmpwpbOjiuWk73QzrEbXZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
