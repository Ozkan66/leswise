import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function EmailTemplatesPage() {
  return (
    <ToolPageTemplate
      icon="📧"
      title="Email Templates"
      description="Vooraf gemaakte email templates voor ouder-communicatie"
      isAvailable={true}
      redirectUrl="/profile"
      features={[
        'Professionele email templates voor verschillende situaties',
        'Automatische personalisatie met leerling en ouder data',
        'Templates voor voortgangsrapporten en mededelingen',
        'Meertalige ondersteuning',
        'Directe verzending vanuit Leswise'
      ]}
      tipText="Begin met het instellen van je email voorkeuren in je profiel."
    />
  );
}