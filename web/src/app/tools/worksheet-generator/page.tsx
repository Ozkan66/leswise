import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function WorksheetGeneratorPage() {
  return (
    <ToolPageTemplate
      icon="📝"
      title="Werkblad Generator"
      description="Genereer automatisch werkbladen met AI op basis van onderwerp en niveau"
      isAvailable={false}
      features={[
        'Automatisch werkbladen genereren op basis van onderwerp',
        'Niveau aanpassing voor verschillende leeftijdsgroepen',
        'Verschillende vraagtypen en oefeningen',
        'Export naar PDF en andere formaten'
      ]}
      tipText="Gebruik ondertussen de bestaande werkblad functionaliteit in het &quot;Worksheets&quot; menu voor handmatige werkblad creatie."
    />
  );
}