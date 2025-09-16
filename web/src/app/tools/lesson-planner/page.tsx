import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function LessonPlannerPage() {
  return (
    <ToolPageTemplate
      icon="🗓️"
      title="Les Planner"
      description="Plan en structureer lessen met AI-ondersteuning"
      isAvailable={true}
      redirectUrl="/worksheets"
      features={[
        'AI-ondersteunde lesplanning op basis van leerdoelen',
        'Automatische tijdschema\u0027s en activiteiten verdeling',
        'Integratie met werkbladen en materialen',
        'Delen van lesplannen met collega\u0027s',
        'Voortgang tracking en evaluatie mogelijkheden'
      ]}
      tipText="Start met het maken van werkbladen die je kunt gebruiken in je lesplannen."
    />
  );
}