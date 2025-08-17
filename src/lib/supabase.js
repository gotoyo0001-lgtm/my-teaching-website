import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uosqryyxmrgddhstjbvk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc3FyeXl4bXJnZGRoc3RqYnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDEzOTksImV4cCI6MjA3MDgxNzM5OX0.ov_2SLIsHfDTkek71kniB6f-1MjcNS1wAgIvsmbxXuc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

