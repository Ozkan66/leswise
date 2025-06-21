import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Privacybeleid - Leswise</h1>
      
      <div style={{ marginBottom: '24px' }}>
        <Link href="/profile" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Terug naar profiel
        </Link>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2>🚧 Privacy Policy in Ontwikkeling</h2>
        <p>
          Ons uitgebreide privacybeleid wordt momenteel ontwikkeld om volledig te voldoen aan 
          AVG/GDPR-richtlijnen. Hieronder vindt u de belangrijkste punten over hoe we met uw 
          gegevens omgaan.
        </p>
      </div>

      <section style={{ marginBottom: '32px' }}>
        <h2>Gegevensbescherming</h2>
        <ul>
          <li>Uw persoonlijke gegevens worden veilig opgeslagen en alleen gebruikt voor het functioneren van het platform</li>
          <li>We delen uw gegevens nooit met derden zonder uw expliciete toestemming</li>
          <li>Voor leerlingen onder 16 jaar gelden extra beschermingsmaatregelen</li>
          <li>U heeft altijd controle over uw eigen gegevens via uw profielinstellingen</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Welke Gegevens Verzamelen We</h2>
        <ul>
          <li><strong>Accountgegevens:</strong> Naam, e-mailadres, rol (docent/leerling)</li>
          <li><strong>Profielinformatie:</strong> Geboortejaar, opleidingstype, instituut, vakken</li>
          <li><strong>Voorkeuren:</strong> Taal, notificatie-instellingen</li>
          <li><strong>Privacy-instellingen:</strong> Uw toestemmingen voor gegevensverwerking</li>
          <li><strong>Gebruiksgegevens:</strong> Anonieme analytics (alleen met uw toestemming)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Uw Rechten</h2>
        <ul>
          <li>Recht op inzage van uw persoonlijke gegevens</li>
          <li>Recht op correctie van onjuiste gegevens</li>
          <li>Recht op verwijdering van uw gegevens</li>
          <li>Recht op overdraagbaarheid van uw gegevens</li>
          <li>Recht om bezwaar te maken tegen verwerking</li>
          <li>Recht om toestemming in te trekken</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Beveiliging</h2>
        <p>
          We implementeren passende technische en organisatorische maatregelen om uw 
          persoonlijke gegevens te beschermen tegen verlies, misbruik, ongeautoriseerde 
          toegang, openbaarmaking, wijziging of vernietiging.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Contact</h2>
        <p>
          Voor vragen over dit privacybeleid of over hoe we met uw gegevens omgaan, 
          kunt u contact met ons opnemen via de contactgegevens op onze website.
        </p>
      </section>

      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #bbdefb'
      }}>
        <h3>✅ Privacy Instellingen Beheren</h3>
        <p>
          U kunt uw privacy-instellingen op elk moment wijzigen via uw{' '}
          <Link href="/profile" style={{ color: '#1565c0', textDecoration: 'underline' }}>
            profielpagina
          </Link>. 
          Daar vindt u alle opties voor het beheren van uw persoonlijke voorkeuren en 
          privacy-toestemmingen.
        </p>
      </div>
    </div>
  );
}