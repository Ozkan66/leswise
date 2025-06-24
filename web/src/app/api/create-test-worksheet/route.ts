import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
    }

    // Set the session
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }

    // Check if user is a teacher
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create test worksheets' }, { status: 403 });
    }

    // Create worksheet
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .insert({
        title: 'Test Werkblad voor Studenten',
        description: 'Een test werkblad om de sharing functionaliteit te testen',
        owner_id: user.id,
        status: 'published'
      })
      .select()
      .single();

    if (worksheetError) {
      return NextResponse.json({ error: `Error creating worksheet: ${worksheetError.message}` }, { status: 500 });
    }

    // Create some tasks
    const tasks = [
      {
        worksheet_id: worksheet.id,
        type: 'multiple_choice',
        content: {
          question: 'Wat is 5 + 3?',
          options: ['6', '7', '8', '9'],
          correct_answer: 2
        },
        position: 1,
        max_score: 1
      },
      {
        worksheet_id: worksheet.id,
        type: 'open_question',
        content: {
          question: 'Beschrijf in één zin wat je van wiskunde vindt.',
          expected_answer: 'Persoonlijke mening over wiskunde'
        },
        position: 2,
        max_score: 2
      }
    ];

    const { data: elements, error: elementsError } = await supabase
      .from('worksheet_elements')
      .insert(tasks)
      .select();

    if (elementsError) {
      return NextResponse.json({ error: `Error creating elements: ${elementsError.message}` }, { status: 500 });
    }

    // Get a student to share with
    const { data: students, error: studentsError } = await supabase
      .from('user_profiles')
      .select('user_id, email')
      .eq('role', 'student')
      .limit(1);

    if (studentsError || !students?.length) {
      return NextResponse.json({ 
        worksheet, 
        elements, 
        message: 'Worksheet created but no students found to share with' 
      });
    }

    const student = students[0];

    // Share with student
    const { data: share, error: shareError } = await supabase
      .from('worksheet_shares')
      .insert({
        worksheet_id: worksheet.id,
        shared_by_user_id: user.id,
        shared_with_user_id: student.user_id,
        permission_level: 'submit'
      })
      .select()
      .single();

    if (shareError) {
      return NextResponse.json({ error: `Error sharing worksheet: ${shareError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      worksheet,
      elements,
      share,
      message: `Worksheet created and shared with ${student.email}`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
