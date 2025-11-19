# PLAN: Landingspagina & Auth-flow (Issue #144)

## Doel
Een publieke, aantrekkelijke landingspagina op de root-URL van Leswise, met duidelijke call-to-actions voor aanmelden en registreren. Alleen na succesvolle login/signup krijgt de gebruiker toegang tot het dashboard.

## Scope
- **In scope:**
  - Publieke landingspagina op `/`
  - Informatieve content (USP’s, doelgroep, screenshots/dummy content, call-to-action)
  - Twee knoppen: “Aanmelden” (Sign in) en “Account aanmaken” (Sign up)
  - Routing naar login (`/login`) en signup (`/signup`)
  - Dashboard/routes alleen toegankelijk na login
- **Out of scope:**
  - Geavanceerde marketing, nieuwsbrief, cookies, analytics
  - Organisatie/scholen registratie

## User Stories & Acceptatiecriteria
- **LP.1:** Informatieve landingspagina, geen toegang tot functies zonder login
- **LP.2:** Twee prominente knoppen, mobiel & desktop zichtbaar
- **LP.3:** “Aanmelden” toont loginflow
- **LP.4:** “Aanmaken” toont registratieformulier
- **LP.5:** Niet-ingelogde gebruikers kunnen dashboard niet zien (redirect naar login)

## Stappenplan

### 1. Analyse & Design
- [ ] Bepaal structuur en content van de landingspagina (USP’s, doelgroep, visuals)
- [ ] Maak wireframe/sketch van de pagina
- [ ] Bepaal branding/styling (consistent met rest van Leswise)

### 2. Implementatie
- [ ] Maak nieuwe pagina aan: `web/src/app/page.tsx`
- [ ] Voeg informatieve tekst, visuals en call-to-action toe
- [ ] Voeg twee knoppen toe: “Aanmelden” (link naar `/login`) en “Account aanmaken” (link naar `/signup`)
- [ ] Zorg voor responsive design (mobiel & desktop)

### 3. Auth-flow & Routing
- [ ] Implementeer Next.js routing voor `/login` en `/signup`
- [ ] Zorg dat knoppen correct routeren
- [ ] Implementeer route-protectie: niet-ingelogde gebruikers worden doorgestuurd naar `/login` bij toegang tot afgeschermde routes

### 4. Validatie & Testen
- [ ] Test landingspagina op verschillende devices
- [ ] Test login/signup flow en redirects
- [ ] Test edge cases (directe toegang tot dashboard, foutieve login, etc.)

### 5. Review & Oplevering
- [ ] Code review
- [ ] Pull request aanmaken en laten reviewen
- [ ] Merge naar `main` en controleren op Vercel

## Randvoorwaarden & Risico’s
- Auth endpoints moeten werken
- Content moet beschikbaar zijn
- Consistente branding vereist
- Onboarding na registratie optioneel

## Deliverables
- Publieke landingspagina op `/`
- Werkende login/signup flow
- Route-protectie voor dashboard
- Responsive en aantrekkelijke UI

---
_Laatste update: 25 juni 2025_
