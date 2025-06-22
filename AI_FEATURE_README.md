# AI-Powered Content Generation - Epic 3.2

## Overview
This implementation provides AI-powered content generation for worksheets, allowing teachers to automatically generate questions using OpenAI's GPT models.

## Features Implemented

### ✅ User Stories Completed

**US 3.2.1**: AI-ondersteuning option during worksheet creation
- Added AI toggle checkbox in `WorksheetCreateForm`
- Clear UI indication of AI support availability

**US 3.2.2**: Form to input leerjaar, vak, and topic
- Grade level dropdown (1e leerjaar basisonderwijs t/m 6e middelbaar)
- Subject text input field
- Topic/onderwerp text input field

**US 3.2.3**: Selection of question types and quantities  
- Support for multiple question types:
  - Multiple Choice (max 10)
  - Single Choice (max 10) 
  - Short Answer (max 8)
  - Essay (max 5)
  - Matching Pairs (max 6)
  - Fill Gaps (max 8)
- Quantity selection per question type

**US 3.2.4**: Review, edit, delete generated questions
- Generated questions appear in existing `WorksheetElementList`
- Full editing capability using existing question editing interface
- Questions can be deleted, reordered, or modified

**US 3.2.5**: Multiple generation rounds
- AI generator can be used multiple times per worksheet
- New questions are added to the bottom of existing questions
- Existing questions are preserved

## Technical Implementation

### Components Added
- `AIWorksheetGenerator`: Main AI generation form component
- Updated `WorksheetCreateForm`: Added AI toggle option
- Updated `WorksheetsPage`: Added AI generator toggle button

### API Endpoint  
- `/api/ai/generate-questions`: Next.js API route for OpenAI integration
- Handles question generation with proper error handling
- Supports all question types with appropriate content structure

### Key Files Modified
- `web/src/components/AIWorksheetGenerator.tsx` (new)
- `web/src/components/WorksheetCreateForm.tsx` (minimal changes)
- `web/src/app/worksheets/page.tsx` (UI integration)
- `web/src/app/api/ai/generate-questions/route.ts` (new)

## Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

**Note**: In production, this should be set as a repository secret.

## Usage Flow

1. **Create Worksheet**: Teacher creates new worksheet with optional AI toggle
2. **Select Worksheet**: Teacher selects worksheet to edit  
3. **Open AI Generator**: Click "🤖 AI Generator" button
4. **Configure Generation**:
   - Select grade level (leerjaar)
   - Enter subject (vak)  
   - Enter topic (onderwerp)
   - Choose question types and quantities
5. **Generate**: Click "🚀 Genereer Vragen" 
6. **Review & Edit**: Generated questions appear in worksheet editor
7. **Repeat**: Use AI generator multiple times if needed

## Testing

### Test Coverage
- `AIWorksheetGenerator.test.tsx`: Complete component testing
- Updated `WorksheetCreateForm.test.tsx`: AI toggle functionality
- Form validation, API integration, error handling

### Running Tests
```bash
npm test
npm test -- --testPathPatterns=AIWorksheetGenerator
```

## Technical Architecture

### Minimal Changes Approach
- Leverages existing worksheet element creation/editing infrastructure
- Reuses existing question type definitions and content structures  
- No database schema changes required
- Integrates seamlessly with existing UI components

### AI Integration
- Uses OpenAI GPT-3.5-turbo model
- Custom prompt engineering for educational content
- JSON response parsing with fallback handling
- Proper error handling and user feedback

### Question Types Supported
All existing question types are supported with proper content structure:
- `multiple_choice`: Question + options + correct answers
- `single_choice`: Question + options + single correct answer  
- `short_answer`: Question + expected answer
- `essay`: Question/prompt only
- `matching`: Question + pairs for matching
- `fill_gaps`: Question + text with gap markers

## Limitations & Notes

### Current Limitations
- Requires OpenAI API key configuration
- AI quality depends on prompt engineering and model responses
- No automatic quality validation (teacher review required)
- Dutch language focused (though supports other languages for language subjects)

### Future Enhancements
- Quality scoring and validation
- More advanced prompt templates
- Custom difficulty levels
- Integration with curriculum standards
- Bulk generation workflows

## Security & Privacy

- No student data sent to AI provider
- Teacher-generated content only
- API key stored securely as environment variable
- Error handling prevents API key exposure