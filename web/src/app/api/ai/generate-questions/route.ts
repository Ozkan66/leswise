import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

// Type definitions for AI generation
interface QuestionTypeRequest {
  [key: string]: number;
}

interface GenerateRequest {
  worksheetId: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  questionTypes: QuestionTypeRequest;
}

interface AIGeneratedQuestion {
  type: string;
  content: string;
  maxScore: number;
}

// OpenAI Integration
async function generateQuestionsWithAI(
  gradeLevel: string,
  subject: string,
  topic: string,
  questionTypes: QuestionTypeRequest
): Promise<AIGeneratedQuestion[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Build prompt based on question types and quantities
  const requestedQuestions = Object.entries(questionTypes)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${count}x ${type.replace('_', ' ')}`)
    .join(', ');

  const prompt = `Als educatieve AI-assistent, genereer vragen voor een werkblad met de volgende specificaties:

Leerjaar: ${gradeLevel}
Vak: ${subject}
Onderwerp: ${topic}
Gevraagde vragen: ${requestedQuestions}

Genereer de vragen in JSON formaat. Voor elk vraagtype:

multiple_choice: { "question": "vraag tekst", "options": ["optie1", "optie2", "optie3", "optie4"], "correctAnswers": [0] }
single_choice: { "question": "vraag tekst", "options": ["optie1", "optie2", "optie3", "optie4"], "correctAnswers": [0] }
short_answer: { "question": "vraag tekst", "correctAnswer": "antwoord" }
essay: { "question": "vraag of opdracht tekst" }
matching: { "question": "instructie tekst", "pairs": [{"left": "item1", "right": "match1"}, {"left": "item2", "right": "match2"}] }
fill_gaps: { "question": "context vraag", "textWithGaps": "tekst met [gap] markers" }

Zorg ervoor dat:
- Vragen geschikt zijn voor het opgegeven leerjaar
- Content relevant is voor het vak en onderwerp
- Antwoorden correct en logisch zijn
- Gebruik Nederlandse taal (behalve als het vak een vreemde taal is)

Return alleen een JSON array met de vragen, geen extra tekst.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Je bent een educatieve AI-assistent die hoogkwalitatieve werkbladcontent genereert. Antwoord altijd in correct JSON formaat.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(aiResponse);
    } catch {
      // Try to extract JSON from response if it contains extra text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Convert to our format and assign types
    const questions: AIGeneratedQuestion[] = [];
    let questionIndex = 0;

    for (const [type, count] of Object.entries(questionTypes)) {
      if (count > 0) {
        for (let i = 0; i < count && questionIndex < parsedQuestions.length; i++) {
          const aiQuestion = parsedQuestions[questionIndex];
          questions.push({
            type,
            content: JSON.stringify(aiQuestion),
            maxScore: type === 'essay' ? 5 : (type === 'matching' ? 2 : 1)
          });
          questionIndex++;
        }
      }
    }

    return questions;

  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate questions with AI');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    const { worksheetId, gradeLevel, subject, topic, questionTypes } = body;

    // Validate required fields
    if (!worksheetId || !gradeLevel || !subject || !topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Note: Authentication is handled by the worksheet creation process
    // and the supabase client will use the user's session
    
    // Generate questions with AI
    const generatedQuestions = await generateQuestionsWithAI(
      gradeLevel,
      subject, 
      topic,
      questionTypes
    );

    // Get current position for new elements
    const { data: existingElements } = await supabase
      .from('worksheet_elements')
      .select('position')
      .eq('worksheet_id', worksheetId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingElements && existingElements.length > 0 
      ? (existingElements[0].position || 0) + 1 
      : 1;

    // Insert generated questions as worksheet elements
    const elementsToInsert = generatedQuestions.map((question, index) => ({
      worksheet_id: worksheetId,
      type: question.type,
      content: question.content,
      max_score: question.maxScore,
      position: nextPosition + index
    }));

    const { error: insertError } = await supabase
      .from('worksheet_elements')
      .insert(elementsToInsert);

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save generated questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${generatedQuestions.length} questions`,
      questionsGenerated: generatedQuestions.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}