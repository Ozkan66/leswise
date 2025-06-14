# Product Requirements Document (PRD)
## Project: Leswise Platform

---

## 1. Doelstelling

Leswise wil een modern educatieplatform bieden waarmee docenten en leerlingen eenvoudig werkbladen kunnen maken, delen, invullen en beheren, met ondersteuning voor multimedia, AI-functionaliteit en gepersonaliseerde gebruikerservaringen.

---

## 2. Scope

- **In Scope:**
  - Gebruikersregistratie en -beheer
  - Aanmaken, bewerken en delen van werkbladen
  - Toegang en feedback voor leerlingen
  - Integratie van multimedia en AI
  - Desktopinterface en contentorganisatie
  - Notificaties en nieuwsbrief

- **Out of Scope:**
  - Mobiele apps (initieel)
  - Geavanceerde analytics
  - Integratie met externe leerplatforms

---

## 3. Doelgroepen en Gebruikers

- **Docenten:** Maken en beheren van werkbladen, delen met leerlingen, feedback geven.
- **Leerlingen:** Maken van toegewezen werkbladen, ontvangen van feedback, toegang tot gedeelde content.
- **Beheerders:** (Optioneel) Beheren van platform, gebruikerssupport.

---

## 4. Functionele Eisen

### 4.1 Gebruikersregistratie & Authenticatie
- Gebruiker kan registreren met e-mail, Google, Microsoft of MyLogin.
- Gebruiker kan inloggen en uitloggen.
- Gebruiker kiest rol (docent of leerling) bij eerste login.

### 4.2 Profielbeheer
- Gebruiker kan persoonlijke gegevens bewerken.
- Leerling kan geboortejaar en opleidingstype invullen.
- Docent kan vakken en instelling opgeven.
- Gebruiker kan profielfoto uploaden/wijzigen.
- Wachtwoordbeheer: wijzigen en resetten via e-mail.

### 4.3 Werkbladen
- Docent kan werkbladen maken, bewerken en verwijderen.
- Werkbladen kunnen gedeeld worden met specifieke gebruikers of publiek.
- Aantal pogingen per werkblad kan worden ingesteld.
- Leerling kan werkbladen invullen, resultaten en feedback inzien.

### 4.4 Multimedia & AI-integratie
- Docent kan plaatjes, video’s en YouTube-links toevoegen.
- AI-assistent ondersteunt bij het maken van werkbladen.

### 4.5 Skill-building & Creatieve Opgaven
- Docent kan stroomdiagram-, video-opname- en creatieve bord-opdrachten maken.
- Storytelling-elementen kunnen worden gebruikt.

### 4.6 Interface & Organisatie
- Desktopinterface toont gemaakte en gedeelde content direct na inloggen.
- Gebruiker kan mappen aanmaken en content organiseren.

### 4.7 Engagement & Communicatie
- Pop-up met updates bij inloggen.
- Overzicht van eerdere updates.
- Gebruiker kan zich abonneren op de nieuwsbrief.

---

## 5. Niet-Functionele Eisen

- **Beveiliging:** Accounts en data zijn adequaat beschermd.
- **Privacy:** AVG/GDPR-compliance (data van minderjarigen).
- **Performance:** Platform is binnen 2 seconden geladen op normale verbinding.
- **Toegankelijkheid:** Voldoet aan WCAG 2.1 AA waar mogelijk.
- **Schaalbaarheid:** Platform ondersteunt groeiend aantal gebruikers zonder prestatieverlies.

---

## 6. Acceptatiecriteria

- Gebruiker kan zonder fouten registeren, inloggen en profiel beheren.
- Docent kan een werkblad maken, delen en feedback geven; leerling kan dit ontvangen.
- AI- en multimediafunctionaliteit werken zoals beschreven.
- Desktopinterface toont relevante content direct na inloggen.
- Notificaties en nieuwsbriefopties zijn zichtbaar en functioneel.

---

## 7. MVP & Sprints

Zie [Sprint Planning](./SPRINT_PLANNING.md) voor gefaseerde oplevering van functionaliteit.

---

## 8. Bijlagen

- [Functionele Breakdown](./FUNCTIONAL_BREAKDOWN.md)
- [Sprint Planning](./SPRINT_PLANNING.md)

---

*Laatste update: 2025-06-14*
