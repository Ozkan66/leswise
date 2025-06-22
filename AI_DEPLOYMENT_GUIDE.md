# AI Werkblad Generator - Deployment Gids

## Probleem Oplossing

De AI Werkblad Generator gaf de foutmelding "Generatie mislukt" vanwege een configuratieprobleem met de OpenAI API key.

## Uitgevoerde Fixes

### 1. ✅ OpenAI Model Name Fix
**Probleem**: De code gebruikte `'gpt-4.1-mini'` wat geen geldige OpenAI model naam is.
**Oplossing**: Gewijzigd naar `'gpt-4o-mini'` (geldige model naam).

### 2. ✅ Verbeterde Error Handling
**Probleem**: Generieke foutmeldingen maakten debugging moeilijk.
**Oplossing**: 
- Specifieke foutmeldingen voor verschillende OpenAI API errors (401, 429, 500)
- Nederlandse foutmeldingen voor gebruikers
- Betere logging voor ontwikkelaars

### 3. ✅ Environment Variable Validatie
**Probleem**: Onduidelijke foutmelding bij ontbrekende API key.
**Oplossing**: Duidelijke Nederlandse foutmelding wanneer OPENAI_API_KEY niet is geconfigureerd.

## Environment Configuration

### ⚠️ Belangrijk: Repository Secrets vs Runtime Environment

**GitHub Repository Secrets** (zoals `OPEN_AI_KEY` die je hebt aangemaakt) zijn **ALLEEN** beschikbaar tijdens:
- GitHub Actions workflows
- CI/CD builds
- Geautomatiseerde deployments

**Runtime Environment Variables** zijn nodig voor de applicatie wanneer deze daadwerkelijk draait.

### Voor Lokale Development

In `/web/.env.local`:
```bash
# OpenAI API Key for AI-powered content generation
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### Voor Production Deployment

#### Vercel Deployment:
1. Ga naar je Vercel project dashboard
2. Navigeer naar Settings → Environment Variables
3. Voeg toe:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Je daadwerkelijke OpenAI API key
   - **Environment**: Production (en Preview als gewenst)

#### Andere Hosting Providers:
Zorg ervoor dat `OPENAI_API_KEY` is ingesteld als environment variable in je hosting omgeving.

## OpenAI API Key Verkrijgen

1. Ga naar [OpenAI Platform](https://platform.openai.com)
2. Log in of maak een account aan
3. Navigeer naar API Keys sectie
4. Maak een nieuwe API key aan
5. Kopieer de key (deze wordt maar één keer getoond!)

## Testen van de Fix

### 1. Lokaal Testen
```bash
cd web
npm install
npm run dev
```

### 2. Productie Testen
Na deployment, test de AI generator door:
1. Naar Worksheets pagina te gaan
2. Een nieuwe worksheet aan te maken met AI-ondersteuning
3. De AI Werkblad Generator in te vullen
4. Op "Genereer Vragen" te klikken

### 3. Foutmeldingen Interpreteren

| Foutmelding | Oorzaak | Oplossing |
|-------------|---------|-----------|
| "OpenAI API key niet geconfigureerd" | OPENAI_API_KEY environment variable ontbreekt | Voeg OPENAI_API_KEY toe aan je hosting environment |
| "OpenAI API key is ongeldig" | API key is incorrect of verlopen | Controleer en vervang je OpenAI API key |
| "OpenAI API limiet bereikt" | Te veel requests of quota overschreden | Wacht of upgrade je OpenAI plan |
| "OpenAI service tijdelijk niet beschikbaar" | OpenAI server problemen | Probeer later opnieuw |

## Model Informatie

De AI generator gebruikt nu **GPT-4o-mini**, wat:
- ✅ Een geldige OpenAI model naam is
- ✅ Kostenefficiënt is voor educatieve content
- ✅ Goede kwaliteit biedt voor Nederlandse educatieve vragen

## Monitoring & Debugging

### Logs Controleren
Bij problemen, controleer de server logs voor:
```
AI generation error: [specifieke fout]
OpenAI API Response: [status code] [response]
```

### Common Issues Checklist
- [ ] OPENAI_API_KEY is ingesteld in runtime environment (niet alleen repository secrets)
- [ ] API key is geldig en actief
- [ ] OpenAI account heeft voldoende credits
- [ ] Netwerk connectiviteit naar OpenAI API
- [ ] Model naam is correct (gpt-4o-mini)

## Support

Voor verdere technische ondersteuning:
1. Controleer server logs voor specifieke foutmeldingen
2. Verifieer environment variable configuratie
3. Test OpenAI API key handmatig indien nodig

---

**Laatst bijgewerkt**: Juni 2025
**Betrekking op**: Issue #139 - AI Werkblad Generator fix