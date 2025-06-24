import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      worksheet_id, 
      shared_by_user_id, 
      shared_with_user_id, 
      permission_level, 
      max_attempts,
      expires_at 
    } = body;

    console.log('SERVER: Creating worksheet share via authenticated client...', {
      worksheet_id,
      shared_by_user_id,
      shared_with_user_id,
      permission_level
    });

    // Get the auth token from the request
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token provided' },
        { status: 401 }
      );
    }

    // Create an authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('SERVER: Auth verification failed:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('SERVER: User authenticated:', user.id);

    // Try the RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_worksheet_share', {
      p_worksheet_id: worksheet_id,
      p_shared_by_user_id: shared_by_user_id,
      p_shared_with_user_id: shared_with_user_id,
      p_permission_level: permission_level,
      p_max_attempts: max_attempts,
      p_expires_at: expires_at
    });

    if (!rpcError) {
      console.log('SERVER: Share created successfully via RPC:', rpcData);
      return NextResponse.json({ success: true, data: { id: rpcData } });
    }

    console.log('SERVER: RPC failed, trying direct insert with authenticated client...');
    console.log('RPC Error:', rpcError);

    // Fall back to direct insert with authenticated client
    const { data: directData, error: directError } = await supabase
      .from('worksheet_shares')
      .insert({
        worksheet_id,
        shared_by_user_id,
        shared_with_user_id,
        permission_level,
        max_attempts,
        expires_at
      })
      .select()
      .single();

    if (directError) {
      console.error('SERVER: Direct insert failed:', directError);
      return NextResponse.json(
        { error: directError.message, details: directError },
        { status: 400 }
      );
    }

    console.log('SERVER: Share created successfully via direct insert:', directData.id);
    return NextResponse.json({ success: true, data: directData });

  } catch (error) {
    console.error('SERVER: API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
