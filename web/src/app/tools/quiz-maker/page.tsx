import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function QuizMakerPage() {
  return (
    <ToolPageTemplate
      icon="🧩"
      title="Quiz Maker"
      description="Maak interactieve quizzen en toetsen met automatische feedback"
      isAvailable={false}
      features={[
        'Interactieve multiple choice quizzen maken',
        'Automatische feedback en scoring',
        'Real-time resultaten dashboard',
        'Delen met leerlingen via links'
      ]}
    />
  );
}