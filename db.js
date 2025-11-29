import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config/supabaseConfig.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const run = async (sql, params = []) => {
  if (sql.toLowerCase().includes('insert into expenses')) {
    const [user_id, amount, item, category, created_at] = params;
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ user_id, amount, item, category, created_at }])
      .select()
      .single();
      
    if (error) throw error;
    return { lastID: data.id };
  }
  
  // For delete operations
  if (sql.toLowerCase().includes('delete from expenses')) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .is('user', params[0] || null);
      
    if (error) throw error;
    return { changes: 1 };
  }
};

export const all = async (sql, params = []) => {
  // Handle different types of select queries
  if (sql.includes('created_at >= ?')) {
    const [user_id, sinceIso] = params;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });

    console.log("SUPABASE RESULT (WITH DATE FILTER) --->", data);  
      
    if (error) throw error;
    return data;
  }
  
  // For simple user-based queries
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', params[0])
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const get = async (sql, params = []) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', params[0])
    .single();
    
  if (error) throw error;
  return data;
};

export const dbInstance = supabase;
