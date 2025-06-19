# Epic 0.4: CI/CD & Deployment – Gedetailleerd Stappenplan

Dit stappenplan beschrijft hoe je een moderne CI/CD-pipeline en deployment-strategie opzet voor het Leswise-platform. De focus ligt op automatisering, betrouwbaarheid en schaalbaarheid voor zowel backend als frontend.

---

## 1. Voorbereiding
- Bepaal waar je wilt deployen (bijv. Vercel, Netlify voor frontend; Supabase, Railway, of andere voor backend).
- Zorg dat je repository op GitHub staat.
- Zorg dat environment variables veilig en gescheiden zijn voor development, staging en production.

## 2. CI/CD Pipeline Opzetten
### a. Kies een CI/CD-platform
- GitHub Actions (aanbevolen)
- Alternatieven: GitLab CI, CircleCI

### b. Maak een workflow-bestand aan
- Voeg `.github/workflows/ci-cd.yml` toe aan je repo.
- Voorbeeld voor Next.js + Supabase:
```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```
- Voeg jobs toe voor deployment naar Vercel/Netlify/Supabase indien gewenst.

### c. Secrets & Environment Variables
- Voeg secrets toe via GitHub repo settings (bijv. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`).
- Gebruik nooit gevoelige data direct in code.

## 3. Deployment Automatiseren
- Koppel je repo aan Vercel/Netlify voor automatische deploys na elke push naar `main`.
- Voor backend: gebruik Supabase deploy of Railway CLI/migrations.
- Voeg (optioneel) een staging-omgeving toe voor testen vóór productie.

## 4. Monitoring & Rollbacks
- Implementeer monitoring (Vercel Analytics, Supabase logs, Sentry, etc.).
- Zorg dat je eenvoudig kunt terugrollen naar een vorige versie bij problemen.

## 5. Documentatie & Onderhoud
- Documenteer het deploymentproces in `README.md` of een aparte `DEPLOYMENT.md`.
- Houd pipelines up-to-date bij nieuwe features of dependencies.

---

## Checklist voor CI/CD & Deployment
- [ ] CI-pipeline draait automatisch linting, tests en builds bij elke push/PR.
- [ ] Secrets zijn veilig opgeslagen en nooit hardcoded.
- [ ] Deployment naar productie gebeurt automatisch na merge naar `main`.
- [ ] Monitoring en rollback-opties zijn aanwezig.
- [ ] Deploymentproces is gedocumenteerd.
