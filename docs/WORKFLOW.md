# Leswise Workflow & Samenwerking

Dit document beschrijft de workflow en samenwerkingsafspraken voor het Leswise project. Deze conventies zorgen voor een consistente en overzichtelijke ontwikkelomgeving.

## 1. Branch Naming Conventies

Gebruik duidelijke en consistente branch namen:

### Branch Types
- `feature/<onderwerp>` - Voor nieuwe functies
  - Voorbeeld: `feature/user-authentication`, `feature/worksheet-editor`
- `fix/<onderwerp>` - Voor bug fixes
  - Voorbeeld: `fix/login-validation`, `fix/mobile-responsive`
- `chore/<onderwerp>` - Voor onderhoud, configuratie en tooling
  - Voorbeeld: `chore/update-dependencies`, `chore/eslint-config`
- `docs/<onderwerp>` - Voor documentatie updates
  - Voorbeeld: `docs/api-documentation`, `docs/setup-guide`
- `refactor/<onderwerp>` - Voor code refactoring
  - Voorbeeld: `refactor/user-service`, `refactor/database-queries`
- `release/<versie>` - Voor release voorbereiding
  - Voorbeeld: `release/v1.0.0`, `release/v1.1.0`

### Branch Naming Regels
- Gebruik kleine letters
- Gebruik hyphens (-) om woorden te scheiden
- Houd namen kort maar beschrijvend
- Gebruik Engelse termen voor technische concepten

## 2. Commit Message Conventies

Gebruik consistent geformatteerde commit messages met prefixen:

### Commit Prefixen
- `feat:` - Nieuwe functie
- `fix:` - Bug fix
- `docs:` - Documentatie wijzigingen
- `style:` - Code formatting, geen functionaliteitswijzigingen
- `refactor:` - Code refactoring
- `test:` - Tests toevoegen of wijzigen
- `chore:` - Build proces, dependencies, configuratie
- `perf:` - Performance verbeteringen
- `ci:` - CI/CD wijzigingen

### Commit Message Format
```
<prefix>: <korte beschrijving>

[Optionele langere beschrijving]

[Optionele referentie naar issue, bv: Fixes #123]
```

### Voorbeelden
```bash
feat: add user profile management
fix: resolve login validation issue
docs: update API documentation
chore: update dependencies to latest versions
feat: implement worksheet sharing (#45)
fix: mobile responsive layout issues (#67)
```

### Commit Message Regels
- Gebruik een duidelijke, korte eerste regel (max 50 karakters)
- Begin met kleine letter na de prefix
- Geen punt aan het einde van de eerste regel
- Gebruik de imperatieve vorm ("add" niet "added")
- Verwijs naar issues met `#issue_nummer` of `Fixes #issue_nummer`

## 3. Review Process

### Voor Solo Ontwikkeling (huidige situatie)
- PR's worden meestal direct gemerged door de maintainer
- Externe bijdragen worden altijd gereviewd en getest
- Self-review van eigen code voor merge

### Voor Externe Bijdragen
- **Altijd reviewen** voor merge
- **Testen** van functionaliteit
- **Code style** controleren
- **Documentatie** nakijken
- **Breaking changes** identificeren

### Review Checklist
- [ ] Code volgt project conventies
- [ ] Tests zijn toegevoegd/bijgewerkt
- [ ] Documentatie is bijgewerkt indien nodig
- [ ] Geen breaking changes zonder goede reden
- [ ] Performance impact overwogen
- [ ] Security aspecten gecontroleerd

## 4. Issue en PR Templates

### Issue Templates
Het project heeft drie standaard issue templates:

1. **Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.yml`)
   - Voor het melden van bugs en problemen
   - Bevat velden voor reproductie stappen, browser info, screenshots

2. **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.yml`)
   - Voor het voorstellen van nieuwe functies
   - Bevat velden voor probleem beschrijving, oplossing, alternatieven

3. **Vraag/Discussie** (`.github/ISSUE_TEMPLATE/question.yml`)
   - Voor vragen en discussies
   - Bevat velden voor context, categorie, gebruikerstype

### Pull Request Template
- Gebruikt checklist voor contributors en reviewers
- Vraagt om beschrijving, type wijziging, test instructies
- Linkt naar gerelateerde issues
- Bevat secties voor screenshots en extra opmerkingen

### Template Gebruik
- **Vul templates zo volledig mogelijk in** voor overzichtelijkheid
- **Pas templates aan** indien specifieke informatie ontbreekt
- **Gebruik labels** consistant voor categorisatie

## 5. Automatisering

### GitHub Actions
Het project gebruikt geautomatiseerde workflows:

- **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
  - Automatische linting, testing en building
  - Deployment naar production bij merge naar `main`
  - Environment variabelen voor veilige configuratie

### Scripts
- **Issue Creation** (`scripts/create_github_issues.py`)
  - Automatiseert het aanmaken van issues vanuit documentatie
  - Gebruikt labels en milestones voor organisatie

### Automatisering Principes
- **Repeterende taken** worden geautomatiseerd waar mogelijk
- **Manual work** wordt vermeden door scripting
- **Consistency** wordt afgedwongen door tooling

## 6. Documentatie & Transparantie

### Documentatie Locaties
- **`docs/`** - Alle project documentatie
- **`README.md`** - Project overzicht en setup instructies
- **`DEPLOYMENT.md`** - Deployment instructies en configuratie

### Documentatie Principes
- **Nieuwe processen** worden direct gedocumenteerd
- **Wijzigingen** worden bijgehouden in relevante documenten
- **Toegankelijkheid** voor externe bijdragers

### Documentatie Updates
- Update documentatie **bij elke proces wijziging**
- Houd **versie geschiedenis** bij waar relevant
- Maak documentatie **begrijpelijk voor externen**

## 7. Externe Samenwerking

### Voor Externe Contributors
1. **Fork** het repository
2. **Maak een feature branch** met juiste naming
3. **Volg commit conventies**
4. **Vul PR template** volledig in
5. **Wacht op review** en feedback
6. **Implementeer feedback** indien gegeven

### Voor Maintainers
1. **Review alle externe PR's**
2. **Test functionaliteit** lokaal
3. **Geef constructieve feedback**
4. **Merge pas na approval**
5. **Update documentatie** indien nodig

## 8. Tools en Configuratie

### Ontwikkeltools
- **ESLint** - Code linting en style consistency
- **Jest** - Unit testing framework
- **TypeScript** - Type safety
- **Next.js** - Frontend framework
- **Supabase** - Backend as a Service

### Code Quality
- Lint errors worden **gecontroleerd in CI**
- Tests moeten **slagen** voor merge
- **Type safety** wordt afgedwongen waar mogelijk

---

Dit workflow document dient als **levend document** en wordt bijgewerkt naarmate het project groeit en evolueert.