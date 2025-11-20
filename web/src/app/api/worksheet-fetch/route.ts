import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// API route to fetch worksheet with tasks for students
// This uses authenticated client which may have better policy access
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const worksheetId = searchParams.get('worksheetId');

        if (!worksheetId) {
            return NextResponse.json(
                { error: 'Missing worksheetId parameter' },
                { status: 400 }
            );
        }

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

        console.log('SERVER: Fetching worksheet for user:', user.id, 'worksheet:', worksheetId);

        // Fetch worksheet
        const { data: worksheet, error: worksheetError } = await supabase
            .from('worksheets')
            .select('*')
            .eq('id', worksheetId)
            .single();

        if (worksheetError) {
            console.error('SERVER: Error fetching worksheet:', worksheetError);
            return NextResponse.json(
                { error: 'Worksheet not found or access denied: ' + worksheetError.message },
                { status: 404 }
            );
        }

        // Fetch tasks with authenticated client
        // This should work if RLS allows viewing tasks for worksheets user has access to
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('worksheet_id', worksheetId)
            .order('order_index', { ascending: true });

        // Don't fail if tasks can't be fetched - return empty array
        if (tasksError) {
            console.warn('SERVER: Could not fetch tasks with RLS:', tasksError);
            console.log('SERVER: Returning worksheet with no tasks');
        }

        const finalTasks = tasks || [];
        console.log('SERVER: Successfully fetched worksheet with', finalTasks.length, 'tasks');

        return NextResponse.json({
            success: true,
            data: {
                worksheet,
                tasks: finalTasks
            }
        });

    } catch (error) {
        console.error('SERVER: API error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
            { status: 500 }
        );
    }
}
