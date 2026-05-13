import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upzictdpfybsbbezcdhf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();
    
    // 1. Check database for a stored passcode
    let dbPasscode = null;
    try {
      const { data } = await supabaseAdmin
        .from('site_settings')
        .select('data')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (data?.data?.adminPasscode) {
        dbPasscode = data.data.adminPasscode;
      }
    } catch (err) {
      console.error('Error fetching passcode from DB:', err);
    }

    const correctPasscode = dbPasscode || process.env.ADMIN_PASSCODE || 'admin@12345';
    
    if (passcode === correctPasscode) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
