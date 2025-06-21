# Epic 1.1: User Registration & Authentication

## Doel
Gebruikers moeten zich eenvoudig, veilig en snel kunnen registreren en authenticeren met e-mail of externe providers (Google, Microsoft, MyLogin). Dit vormt het fundament voor gepersonaliseerd gebruik van het Leswise-platform.

## Scope (In/Out)
- **In scope:**
  - Registratie via e-mail & wachtwoord
  - Quick registration & login via Google, Microsoft, MyLogin
  - Login met e-mail/wachtwoord
  - Uitloggen (veilig op gedeelde apparaten)
  - Basis GDPR/AVG-compliance
- **Out of scope:**
  - Two-factor authentication (valt onder security, aparte epic)
  - Mobiele apps (initiële versie)
  - Integratie met andere (onderwijs)platforms

## User stories (met refinement)
### US 1.1.1
Als nieuwe gebruiker wil ik registeren met e-mailadres, voornaam, achternaam en wachtwoord, zodat ik toegang krijg tot het platform.
- Acceptance Criteria:
  - Gebruiker vult verplichte velden in (e-mail, voornaam, achternaam, wachtwoord)
  - Foutmeldingen bij ontbrekende/ongeldige velden
  - Na registratie wordt gebruiker direct ingelogd of ontvangt bevestigingsmail (afhankelijk van flow)
  - Gegevens worden AVG-conform opgeslagen

### US 1.1.2
Als nieuwe gebruiker wil ik snel registeren via Google, Microsoft of MyLogin, zodat ik tijd bespaar.
- Acceptance Criteria:
  - Koppeling met OAuth-providers (Google, Microsoft, MyLogin)
  - Na succesvolle authorisatie wordt gebruiker automatisch ingelogd of kan profiel aanvullen
  - Privacyverklaring wordt getoond vóór afronden registratie

### US 1.1.3
Als geregistreerde gebruiker wil ik kunnen inloggen met e-mail en wachtwoord, zodat ik mijn gepersonaliseerde content kan benaderen.
- Acceptance Criteria:
  - Login-formulier aanwezig op inlogpagina
  - Validatie van gebruikersgegevens
  - Foutmelding bij verkeerde inlog
  - Na login wordt relevante desktopinterface getoond

### US 1.1.4
Als geregistreerde gebruiker wil ik snel kunnen inloggen met Google, Microsoft of MyLogin.
- Acceptance Criteria:
  - Quick login-knoppen zichtbaar bij login
  - SSO-flow identiek aan registratie, maar gericht op bestaande accounts
  - Fallback naar standaard login mogelijk

### US 1.1.5
Als geregistreerde gebruiker wil ik kunnen uitloggen, zodat mijn account veilig blijft op gedeelde apparaten.
- Acceptance Criteria:
  - Sign out-optie duidelijk zichtbaar (dropdown)
  - Na uitloggen wordt gebruiker teruggeleid naar publieke landing page
  - Cookies/sessies worden gewist

## Randvoorwaarden & afhankelijkheden
- OAuth-implementatie vereist registratie bij Google/Microsoft/MyLogin
- Backend moet veilige opslag en validatie van wachtwoorden ondersteunen (hashing, geen plaintext)
- Frontend toont foutmeldingen en validatiestates duidelijk
- GDPR/AVG: privacyverklaring en toestemming bij registratie

## Bekende risico's of aandachtspunten
- Mogelijke complexiteit in user flows tussen e-mail/SSO
- Synchronisatie tussen profielvelden bij verschillende registratieopties
- Onboarding moet snel en niet verwarrend zijn

## Prioritering & planning (Sprint 1 voorstel)
1. E-mail registratie & login (US 1.1.1, US 1.1.3, US 1.1.5)
2. SSO registratie & login (US 1.1.2, US 1.1.4)
3. Foutafhandeling, validatie, GDPR-onderdelen

## Acceptatiecriteria voor de hele epic
- Gebruiker kan zonder fouten registeren, inloggen (e-mail/SSO) en uitloggen
- Alle flows zijn getest (ook edge cases, bijv. duplicate e-mail, afgebroken registratie)
- Nieuwe gebruikers starten met correct profieltype (docent/leerling)
- Er is een privacybeleid zichtbaar en akkoord vereist bij registratie

## Design & technische details
- Zie docs/FEATURES.md, docs/FUNCTIONAL_BREAKDOWN.md, docs/PRD.md voor velden, flows en eisen
- Backend: Supabase-authenticatie of eigen Node/Express-auth
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