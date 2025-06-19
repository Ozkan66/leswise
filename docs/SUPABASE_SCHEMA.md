# Supabase Schema Documentation

This document describes the core database tables, relationships, and Row Level Security (RLS) policies for the Leswise platform MVP.

---

## Table Overview

### 1. users (managed by Supabase Auth)
- **id** (uuid, PK): Unique user identifier (matches Supabase Auth UID)
- **email** (text): User email
- **...**: Additional profile fields as needed (see your current schema)

### 2. groups
- **id** (uuid, PK): Unique group ID
- **name** (text): Group name
- **created_by** (uuid, FK → users.id): User who created the group
- **jumper_code** (text): Unique join code
- **created_at** (timestamp): Creation time

### 3. group_members
- **group_id** (uuid, FK → groups.id): Group reference
- **user_id** (uuid, FK → users.id): User reference
- **role** (text): 'leader' or 'member'
- **status** (text): 'pending', 'active'
- **joined_at** (timestamp): When user joined
- **PK:** (group_id, user_id)

### 4. folders
- **id** (uuid, PK): Unique folder ID
- **name** (text): Folder name
- **owner_id** (uuid, FK → users.id): Folder owner
- **parent_folder_id** (uuid, FK → folders.id, nullable): For nested folders
- **created_at** (timestamp): Creation time

### 5. worksheets
- **id** (uuid, PK): Worksheet ID
- **title** (text): Worksheet title
- **description** (text): Worksheet description
- **owner_id** (uuid, FK → users.id): Worksheet owner
- **folder_id** (uuid, FK → folders.id, nullable): Folder containing worksheet
- **is_shared** (boolean): Shared/public flag
- **created_at** (timestamp): Creation time

### 6. worksheet_elements
- **id** (uuid, PK): Content block ID
- **worksheet_id** (uuid, FK → worksheets.id): Parent worksheet
- **type** (text): 'text', 'video', 'pdf', 'formula', 'link'
- **content** (jsonb): Content data (flexible per type)
- **position** (integer): Order within worksheet
- **created_at** (timestamp): Creation time

### 7. submissions
- **id** (uuid, PK): Submission ID
- **worksheet_id** (uuid, FK → worksheets.id): Worksheet reference
- **user_id** (uuid, FK → users.id): Student who submitted
- **submitted_at** (timestamp): Submission time

### 8. submission_elements
- **id** (uuid, PK): Answer block ID
- **submission_id** (uuid, FK → submissions.id): Parent submission
- **worksheet_element_id** (uuid, FK → worksheet_elements.id): Question answered
- **answer** (text): Student answer
- **created_at** (timestamp): Creation time

---

## Relationships
- **users** ↔ **groups**: many-to-many via group_members
- **users** ↔ **folders**: one-to-many (owner_id)
- **users** ↔ **worksheets**: one-to-many (owner_id)
- **folders** ↔ **worksheets**: one-to-many
- **worksheets** ↔ **worksheet_elements**: one-to-many
- **worksheets** ↔ **submissions**: one-to-many
- **submissions** ↔ **submission_elements**: one-to-many

---

## RLS Policy Summary
- Users can only access (select/insert/update/delete) rows where they are the owner, creator, or member (see SQL for details).
- Worksheet owners can access their worksheets and elements.
- Group members can access their group memberships.
- Students can access their own submissions and answers.

---

## Future Expansion
- Add tables for AI generations, storage quota, worksheet library, analytics, etc., as needed.
- Refine RLS for more granular permissions (e.g., group leaders, shared/public worksheets).

---

*Last updated: 2025-06-19*
