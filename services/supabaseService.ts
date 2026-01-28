
import { createClient } from '@supabase/supabase-js';

// 從環境變數獲取連線資訊
const supabaseUrl = (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const syncDataToCloud = async (userId: string, accounts: any[], transactions: any[], budgets: any[]) => {
  if (!supabase) return;

  try {
    const { error: accError } = await supabase.from('accounts').upsert(
      accounts.map(a => ({ ...a, user_id: userId }))
    );
    
    const { error: txError } = await supabase.from('transactions').upsert(
      transactions.map(t => ({ ...t, user_id: userId }))
    );

    if (accError || txError) {
      console.error('Cloud Sync Error:', { accError, txError });
    }
  } catch (err) {
    console.error('Failed to sync to cloud:', err);
  }
};

export const fetchCloudData = async (userId: string) => {
  if (!supabase) return null;

  try {
    const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', userId);
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', userId);

    return { accounts, transactions, budgets };
  } catch (err) {
    console.error('Failed to fetch cloud data:', err);
    return null;
  }
};
