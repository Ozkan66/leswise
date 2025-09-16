import ToolPageTemplate from '../../../components/ToolPageTemplate';

export default function GradeAnalyzerPage() {
  return (
    <ToolPageTemplate
      icon="📊"
      title="Cijfer Analyzer"
      description="Analyseer prestaties en genereer rapporten voor individuele leerlingen"
      isAvailable={true}
      redirectUrl="/teacher-submissions"
      features={[
        'Gedetailleerde prestatie analyses per leerling',
        'Voortgang tracking over tijd',
        'Vergelijking met klasgemiddelden',
        'Automatische rapport generatie'
      ]}
      tipText="Deze tool gebruikt je bestaande inzendingen data om inzichten te genereren."
    />
  );
}