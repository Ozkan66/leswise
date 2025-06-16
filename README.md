# Leswise

Dit is het centrale project voor het ontwikkelen van het Leswise educatieplatform.

## Inhoud
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Functionele Breakdown](docs/FUNCTIONAL_BREAKDOWN.md)
- [Sprint Planning](docs/SPRINT_PLANNING.md)

## Doel
Een modern educatieplatform waarmee docenten en leerlingen eenvoudig werkbladen kunnen maken, delen, invullen en beheren.

## Contact
Voor vragen of bijdragen: [Ozkan66](https://github.com/Ozkan66)

## Automated Issue Creation

Use `scripts/create_github_issues.py` to generate GitHub issues for all initiatives, epics and user stories.
The script requires environment variables `GITHUB_TOKEN` (with repo scope) and `GITHUB_REPO` set to `owner/repo`.

```bash
python3 scripts/create_github_issues.py
```

This will create labels, milestones for sprints 0-9 and link issues together using references in the body.
