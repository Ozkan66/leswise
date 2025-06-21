# Epic 1.2: User Profile Management

## Doel
Gebruikers moeten hun profiel eenvoudig kunnen beheren en personaliseren, zodat het platform optimaal aansluit bij hun rol (docent/leerling) en persoonlijke voorkeuren.

## Scope (In/Out)
- **In scope:**
  - Persoonlijke gegevens bewerken (naam, e-mail, etc.)
  - Keuze en wijziging van rol (docent of leerling, bij eerste login)
  - Leerling: geboortejaar en opleidingstype invullen
  - Docent: instelling en vakken opgeven
  - Profielfoto uploaden en wijzigen
  - AVG/GDPR-conforme gegevensverwerking
- **Out of scope:**
  - Rollen en rechtenbeheer op organisatieniveau (zie evt. aparte epic)
  - Accountverwijdering (valt onder security/account management)
  - Geavanceerde profielanalytics

## User stories (met refinement)
### US 1.2.1
Als geregistreerde gebruiker wil ik mijn persoonlijke gegevens kunnen bewerken.
- Acceptance Criteria:
  - Gebruiker kan naam, e-mailadres en (indien van toepassing) andere velden bewerken
  - Wijzigingen worden direct opgeslagen en zichtbaar
  - Onjuiste invoer wordt duidelijk gemeld

### US 1.2.2
Als gebruiker wil ik bij eerste login aangeven of ik docent of leerling ben, zodat Leswise mijn ervaring kan afstemmen.
- Acceptance Criteria:
  - Bij eerste login wordt gebruiker gevraagd om rol te kiezen
  - De gekozen rol bepaalt de standaardweergave en beschikbare functies
  - Rol kan achteraf in profiel worden aangepast (indien gewenst)

### US 1.2.3
Als leerling wil ik geboortejaar en type opleiding invullen, zodat ik persoonlijke begeleiding ontvang.
- Acceptance Criteria:
  - Leerling ziet velden voor geboortejaar en opleidingstype
  - Gegevens worden gebruikt voor personalisatie en rapportages
  - Privacy wordt gewaarborgd (zie AVG)

### US 1.2.4
Als docent wil ik extra informatie delen (zoals instelling, vakken), voor persoonlijke begeleiding.
- Acceptance Criteria:
  - Docent ziet velden voor instelling en vakken
  - Ingevulde gegevens kunnen worden aangepast
  - Gegevens worden alleen intern gebruikt en niet publiek getoond

### US 1.2.5
Als gebruiker wil ik een profielfoto kunnen uploaden en wijzigen.
- Acceptance Criteria:
  - Gebruiker kan foto uploaden (max 5 MB, jpg/png/gif)
  - Na upload is nieuwe foto direct zichtbaar in profiel en interface
  - Onjuiste bestandsformaten/te grote bestanden worden geweigerd

## Randvoorwaarden & afhankelijkheden
- Profielbeheer vereist veilige opslag en verwerking van persoonsgegevens (AVG/GDPR)
- Backend moet endpoints bieden voor updaten van gebruikersgegevens/profielfoto
- Frontend moet duidelijke validatie en feedback tonen
- Rolkeuze beïnvloedt beschikbaarheid van bepaalde functionaliteiten

## Bekende risico's of aandachtspunten
- Privacy van (minderjarige) leerlingen waarborgen
- Rol-switch kan gevolgen hebben voor rechten/toegankelijkheid binnen het platform
- Gevoelige gegevens (zoals geboortedatum) versleuteld opslaan

## Prioritering & planning (Sprint 1 voorstel)
1. Basis profielbeheer: gegevens bewerken (US 1.2.1, US 1.2.5)
2. Rolkeuze bij onboarding en profiel (US 1.2.2)
3. Specifieke velden voor leerling/docent (US 1.2.3, US 1.2.4)
4. Validatie, privacy en security-aspecten

## Acceptatiecriteria voor de hele epic
- Gebruiker kan zonder fouten zijn profiel volledig beheren
- Onboarding flow vraagt altijd om rolkeuze (docent/leerling)
- Profielaanpassingen zijn direct zichtbaar en persistent
- Privacy en data security zijn aantoonbaar geborgd

## Design & technische details
- Zie docs/FEATURES.md, docs/FUNCTIONAL_BREAKDOWN.md, docs/PRD.md voor velden, flows en eisen
- Backend: Supabase of eigen API voor gebruikersdata en media-opslag
- Frontend: Next.js/React met duidelijke user feedback en loading states

## Checklist (Done = refinement afgerond)
- [x] User stories gestructureerd en aangevuld
- [x] Acceptance criteria per story toegevoegd
- [x] Scope/Out-of-scope benoemd
- [x] Randvoorwaarden en risico's beschreven
- [x] Prioriteit en volgorde bepaald
- [x] Link naar relevante documentatie

---

> Laat weten als je voor specifieke user stories technische uitwerking, wireframes of API-schetsen wilt!