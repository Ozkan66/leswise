import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function ContentLibraryPage() {
  return (
    <ToolPageTemplate
      icon="📚"
      title="Content Bibliotheek"
      description="Toegang tot duizenden educatieve resources en materialen"
      isAvailable={true}
      redirectUrl="/worksheets"
      features={[
        'Duizenden kant-en-klare werkbladen en oefeningen',
        'Materialen voor alle leeftijdsgroepen en vakken',
        'Zoeken op onderwerp, niveau en vakgebied',
        'Direct downloaden en aanpassen',
        'Nieuwe content wordt wekelijks toegevoegd'
      ]}
      tipText="Deze tool geeft toegang tot onze uitgebreide content bibliotheek via het worksheets menu."
    />
  );
}