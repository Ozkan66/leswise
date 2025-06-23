import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  content: Record<string, unknown>; // Changed from string to object to match WorksheetElement
  maxScore: number;
}

// Mock question generator for testing when OpenAI API key is not available
function generateMockQuestions(questionTypes: QuestionTypeRequest, subject: string, topic: string): AIGeneratedQuestion[] {
  const questions: AIGeneratedQuestion[] = [];
  
  const mockTemplates = {
    multiple_choice: {
      title: `Multiple Choice: ${topic} in ${subject}`,
      question: `What is an important aspect of ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswers: [0, 2]
    },
    single_choice: {
      title: `Single Choice: ${topic} in ${subject}`,
      question: `Which statement about ${topic} is correct?`,
      options: ["Statement A", "Statement B", "Statement C", "Statement D"],
      correctAnswers: [1]
    },
    short_answer: {
      title: `Short Answer: ${topic}`,
      question: `Explain the main concept of ${topic} in a few sentences.`,
      expectedAnswer: `A brief explanation about ${topic}`
    },
    essay: {
      title: `Essay: ${topic} in ${subject}`,
      question: `Write a detailed essay about ${topic}. Discuss its importance and applications.`,
      rubric: ["Introduction", "Main points", "Examples", "Conclusion"]
    }
  };

  Object.entries(questionTypes).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      const template = mockTemplates[type as keyof typeof mockTemplates];
      if (template) {
        questions.push({
          type,
          content: {
            ...template,
            title: `${template.title} (${i + 1})`
          },
          maxScore: type === 'essay' ? 5 : (type === 'matching' ? 2 : 1)
        });
      }
    }
  });

  return questions;
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
    // For development/testing purposes, return mock questions
    console.log('⚠️ OpenAI API key not configured, returning mock questions for testing');
    return generateMockQuestions(questionTypes, subject, topic);
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

Genereer de vragen in JSON formaat. Elke vraag moet direct de vraag data bevatten zonder extra wrapper keys:

Voor multiple_choice: { "question": "vraag tekst", "options": ["optie1", "optie2", "optie3", "optie4"], "correctAnswers": [0] }
Voor single_choice: { "question": "vraag tekst", "options": ["optie1", "optie2", "optie3", "optie4"], "correctAnswers": [0] }
Voor short_answer: { "question": "vraag tekst", "correctAnswer": "antwoord" }
Voor essay: { "question": "vraag of opdracht tekst" }
Voor matching: { "question": "instructie tekst", "pairs": [{"left": "item1", "right": "match1"}, {"left": "item2", "right": "match2"}] }
Voor fill_gaps: { "question": "context vraag", "textWithGaps": "tekst met [gap] markers" }

BELANGRIJK: Return alleen een JSON array met de vraag objecten, ZONDER type wrappers zoals "multiple_choice": {...}

Voorbeeld voor 1 meerkeuzevraag:
[
  {
    "question": "Wat is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswers": [1]
  }
]

Zorg ervoor dat:
- Vragen geschikt zijn voor het opgegeven leerjaar
- Content relevant is voor het vak en onderwerp
- Antwoorden correct en logisch zijn
- Gebruik Nederlandse taal (behalve als het vak een vreemde taal is)
- Return alleen de JSON array, geen extra tekst of code blocks`;

  console.log('🤖 AI PROMPT VERZONDEN:');
  console.log('='.repeat(80));
  console.log(prompt);
  console.log('='.repeat(80));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Je bent een educatieve AI-assistent die hoogkwalitatieve werkbladcontent genereert. Antwoord ALLEEN met valid JSON arrays, geen code blocks, geen extra tekst, geen wrapper keys.'
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
      const errorText = await response.text();
      console.error('OpenAI API Response:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('OpenAI API key is ongeldig. Controleer de API key configuratie.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API limiet bereikt. Probeer het later opnieuw.');
      } else if (response.status === 500) {
        throw new Error('OpenAI service is tijdelijk niet beschikbaar. Probeer het later opnieuw.');
      } else {
        throw new Error(`OpenAI API fout: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    console.log('🤖 AI RESPONSE ONTVANGEN:');
    console.log('='.repeat(80));
    console.log('Raw OpenAI response data:', JSON.stringify(data, null, 2));
    console.log('Extracted AI content:', aiResponse);
    console.log('='.repeat(80));

    if (!aiResponse) {
      throw new Error('Geen antwoord ontvangen van OpenAI API');
    }

    // Parse AI response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(aiResponse);
      console.log('✅ JSON PARSING SUCCESVOL:', JSON.stringify(parsedQuestions, null, 2));
    } catch (parseError) {
      console.log('❌ JSON PARSING GEFAALD, probeer JSON extractie...');
      console.log('Parse error:', parseError);
      // Try to extract JSON from response if it contains extra text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🔍 JSON GEVONDEN via regex:', jsonMatch[0]);
        parsedQuestions = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON EXTRACTIE SUCCESVOL:', JSON.stringify(parsedQuestions, null, 2));
      } else {
        console.error('❌ GEEN JSON GEVONDEN in response:', aiResponse);
        throw new Error('Ongeldig JSON antwoord van AI. Probeer het opnieuw.');
      }
    }

    if (!Array.isArray(parsedQuestions)) {
      console.error('❌ RESPONSE IS GEEN ARRAY:', typeof parsedQuestions, parsedQuestions);
      throw new Error('AI antwoord is geen geldige array van vragen');
    }

    console.log('📝 TRANSFORMATIE NAAR WORKSHEET ELEMENTS:');
    console.log('Input parsed questions:', JSON.stringify(parsedQuestions, null, 2));
    console.log('Input question types:', JSON.stringify(questionTypes, null, 2));

    // Convert to our format and assign types
    const questions: AIGeneratedQuestion[] = [];
    let questionIndex = 0;

    for (const [type, count] of Object.entries(questionTypes)) {
      console.log(`🔄 Verwerken type: ${type}, aantal: ${count}`);
      if (count > 0) {
        for (let i = 0; i < count && questionIndex < parsedQuestions.length; i++) {
          const aiQuestion = parsedQuestions[questionIndex];
          console.log(`   - Verwerken vraag ${questionIndex}:`, JSON.stringify(aiQuestion, null, 2));
          
          const transformedQuestion = {
            type,
            content: aiQuestion, // Store as object, not stringified
            maxScore: type === 'essay' ? 5 : (type === 'matching' ? 2 : 1)
          };
          
          console.log(`   - Getransformeerd naar:`, JSON.stringify(transformedQuestion, null, 2));
          questions.push(transformedQuestion);
          questionIndex++;
        }
      }
    }

    console.log('🎯 FINALE QUESTIONS ARRAY:', JSON.stringify(questions, null, 2));

    if (questions.length === 0) {
      throw new Error('Geen vragen gegenereerd. Probeer andere instellingen.');
    }

    return questions;

  } catch (error) {
    console.error('AI generation error:', error);
    
    if (error instanceof Error) {
      // Re-throw our custom error messages
      throw error;
    }
    
    throw new Error('Onbekende fout bij genereren van vragen. Probeer het opnieuw.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    const { worksheetId, gradeLevel, subject, topic, questionTypes } = body;

    // Validate required fields
    if (!worksheetId || !gradeLevel || !subject || !topic) {
      return NextResponse.json(
        { success: false, message: 'Ontbrekende verplichte velden. Controleer of alle velden zijn ingevuld.' },
        { status: 400 }
      );
    }

    // Get authorization header for user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Geen geldige autorisatie. Log opnieuw in.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Verify user is authenticated and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Ongeldige gebruikerssessie. Log opnieuw in.' },
        { status: 401 }
      );
    }
    
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

    console.log('💾 DATABASE INSERT VOORBEREID:');
    console.log('Elements to insert:', JSON.stringify(elementsToInsert, null, 2));

    const { data: insertedElements, error: insertError } = await supabase
      .from('worksheet_elements')
      .insert(elementsToInsert)
      .select(); // Select the inserted elements to return them

    if (insertError) {
      console.error('❌ DATABASE INSERT ERROR:', insertError);
      return NextResponse.json(
        { success: false, message: 'Kon gegenereerde vragen niet opslaan in database. Probeer het opnieuw.' },
        { status: 500 }
      );
    }

    console.log('✅ DATABASE INSERT SUCCESVOL!');

    return NextResponse.json({
      success: true,
      message: `Succesvol ${generatedQuestions.length} vragen gegenereerd`,
      tasks: insertedElements // Return the actual inserted tasks
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Interne serverfout opgetreden' },
      { status: 500 }
    );
  }
}
