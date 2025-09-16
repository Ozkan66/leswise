import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function StudentTrackerPage() {
  return (
    <ToolPageTemplate
      icon="👥"
      title="Leerling Tracker"
      description="Volg voortgang en gedrag van leerlingen in real-time"
      isAvailable={true}
      redirectUrl="/teacher-submissions"
      features={[
        'Real-time voortgang monitoring per leerling',
        'Gedrag en participatie tracking',
        'Automatische waarschuwingen bij afwijkingen',
        'Overzichtelijke dashboards voor ouders',
        'Integratie met bestaande cijfersystemen'
      ]}
      tipText="Gebruik de teacher submissions pagina om voortgang van leerlingen te volgen."
    />
  );
}