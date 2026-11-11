import { supabase } from './supabase';

export const logAdminActivity = async (module, action, adminName = 'Administrator', details = '') => {
  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        module: module,
        action: action,
        performed_by: adminName,
        details: details,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error recording admin log:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error in logAdminActivity:', err);
  }
};