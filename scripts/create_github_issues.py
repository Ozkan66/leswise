import os
import re
import requests

GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
GITHUB_REPO = os.environ.get('GITHUB_REPO')  # format: owner/repo

if not GITHUB_TOKEN or not GITHUB_REPO:
    raise SystemExit('GITHUB_TOKEN and GITHUB_REPO environment variables are required')

API_URL = f'https://api.github.com/repos/{GITHUB_REPO}'
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github+json'
}

ACCEPTANCE_CRITERIA = []

# Parse acceptance criteria from PRD.md
with open('docs/PRD.md', 'r', encoding='utf-8') as f:
    prd_text = f.read()

ac_match = re.search(r'## 6\. Acceptatiecriteria\n(.*?)(?:\n##|\Z)', prd_text, re.S)
if ac_match:
    for line in ac_match.group(1).splitlines():
        line = line.strip()
        if line.startswith('-'):
            ACCEPTANCE_CRITERIA.append(line[1:].strip())

# create checklist string
CHECKLIST = '\n'.join(f'- [ ] {item}' for item in ACCEPTANCE_CRITERIA)


def ensure_label(name, color='ffffff'):
    resp = requests.get(f'{API_URL}/labels/{name}', headers=HEADERS)
    if resp.status_code == 404:
        requests.post(f'{API_URL}/labels', headers=HEADERS, json={'name': name, 'color': color})


def ensure_milestone(title):
    resp = requests.get(f'{API_URL}/milestones?state=all', headers=HEADERS)
    resp.raise_for_status()
    for ms in resp.json():
        if ms['title'] == title:
            return ms['number']
    resp = requests.post(f'{API_URL}/milestones', headers=HEADERS, json={'title': title})
    resp.raise_for_status()
    return resp.json()['number']


def create_issue(title, body, labels=None, milestone=None):
    data = {'title': title, 'body': body}
    if labels:
        data['labels'] = labels
    if milestone:
        data['milestone'] = milestone
    resp = requests.post(f'{API_URL}/issues', headers=HEADERS, json=data)
    resp.raise_for_status()
    return resp.json()['number']


# prepare labels
ensure_label('initiative', '1f77b4')
ensure_label('epic', 'ff7f0e')
ensure_label('user story', '2ca02c')
ensure_label('backend', '8c564b')
ensure_label('frontend', '17becf')
ensure_label('devops', '9467bd')
ensure_label('ai', 'e377c2')

# prepare milestones for sprints 0-9
MILESTONES = {}
for i in range(10):
    title = f'Sprint {i}'
    MILESTONES[i] = ensure_milestone(title)

# parse ISSUE_OVERVIEW.md
initiatives = []
current_initiative = None
current_epic = None
story_regex = re.compile(r'US ([\d\.]+): (.*?) \(_Sprint (\d+)_\)')

with open('docs/ISSUE_OVERVIEW.md', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('## Initiatief'):
            name = line.strip('# ').strip()
            current_initiative = {'name': name, 'epics': []}
            initiatives.append(current_initiative)
        elif line.strip().startswith('- **Epic'):
            epic_name = line.strip().lstrip('- ').strip('**')
            current_epic = {'name': epic_name, 'stories': []}
            if current_initiative is not None:
                current_initiative['epics'].append(current_epic)
        else:
            m = story_regex.search(line)
            if m and current_epic is not None:
                story = {
                    'code': m.group(1),
                    'description': m.group(2),
                    'sprint': int(m.group(3))
                }
                current_epic['stories'].append(story)

# create issues
initiative_numbers = {}
epic_numbers = {}

for init in initiatives:
    body = f'This issue tracks **{init["name"]}**.'
    num = create_issue(init['name'], body, labels=['initiative'])
    initiative_numbers[init['name']] = num
    for epic in init['epics']:
        tech_labels = ['epic']
        name_lower = epic['name'].lower()
        if 'backend' in name_lower or 'api' in name_lower or 'database' in name_lower:
            tech_labels.append('backend')
        if 'frontend' in name_lower or 'interface' in name_lower or 'desktop' in name_lower:
            tech_labels.append('frontend')
        if 'ci/cd' in name_lower or 'deployment' in name_lower or 'workflow' in name_lower:
            tech_labels.append('devops')
        if 'ai' in name_lower:
            tech_labels.append('ai')
        epic_body = f'Parent Initiative: #{num}'
        epic_num = create_issue(epic['name'], epic_body, labels=tech_labels)
        epic_numbers[epic['name']] = epic_num
        for story in epic['stories']:
            story_labels = ['user story'] + [l for l in tech_labels if l != 'epic']
            milestone_num = MILESTONES.get(story['sprint'])
            story_body = f'{story["description"]}\n\nParent Epic: #{epic_num}\n\n### Acceptance Criteria\n{CHECKLIST}'
            create_issue(f'US {story["code"]}', story_body, labels=story_labels, milestone=milestone_num)
