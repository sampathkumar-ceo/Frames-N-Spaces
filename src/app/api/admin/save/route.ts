import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Service Role key (bypasses RLS)
const supabaseUrl = 'https://upzictdpfybsbbezcdhf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);

export async function POST(request: Request) {
  try {
    const { passcode, data } = await request.json();

    // 1. Check database for a stored passcode
    let dbPasscode = null;
    try {
      const { data: settingsData } = await supabaseAdmin
        .from('site_settings')
        .select('data')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (settingsData?.data?.adminPasscode) {
        dbPasscode = settingsData.data.adminPasscode;
      }
    } catch (err) {
      console.error('Error fetching passcode from DB in save route:', err);
    }

    const correctPasscode = dbPasscode || process.env.ADMIN_PASSCODE || 'admin@12345';

    if (passcode !== correctPasscode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid passcode',
        },
        { status: 401 }
      );
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'SUPABASE_SERVICE_ROLE_KEY is missing',
        },
        { status: 500 }
      );
    }

    // Fetch latest ID manually
    const { data: rows, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error(
        'Supabase fetch error:',
        JSON.stringify(fetchError, null, 2)
      );

      return NextResponse.json(
        {
          success: false,
          error: fetchError,
        },
        { status: 500 }
      );
    }

    const newId =
      rows && rows.length > 0 ? rows[0].id + 1 : 1;

    const { error: insertError } = await supabaseAdmin
      .from('site_settings')
      .insert({
        id: newId,
        data,
      });

    if (insertError) {
      console.error(
        'Supabase insert error:',
        JSON.stringify(insertError, null, 2)
      );

      return NextResponse.json(
        {
          success: false,
          error: insertError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      'API error:',
      JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}