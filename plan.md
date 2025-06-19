# Leswise Development Plan

## Notes
- Supabase Auth and profile sync are working and tested.
- All core tables (users, groups, group_members, folders, worksheets, worksheet_elements, submissions, submission_elements) are created with RLS policies.
- Schema is documented in `docs/SUPABASE_SCHEMA.md`.
- Frontend is set up with user registration and display.

## Task List
- [x] Set up Supabase connection and basic CRUD functionality.
- [x] Refactor the frontend code.
- [x] Address GitHub Issue #21: "Initiatief 0: Technische Voorbereiding & Projectfundament".
- [x] Backend setup: Supabase schema, RLS, Auth/profile sync, documentation.
- [ ] Seed/Test Data
  - [ ] Add example groups, folders, worksheets, worksheet elements, and submissions in Supabase dashboard or via SQL.
- [ ] Frontend Integration
  - [ ] List/create groups and folders in the app.
  - [ ] Create/display worksheets and worksheet elements.
  - [ ] Allow students to submit answers (submissions).
- [ ] Integration Tests
  - [ ] Write integration tests for Supabase client logic (e.g., worksheet creation, submissions, group flows).
- [ ] (Optional) Supabase CLI for Migrations
  - [ ] Set up Supabase CLI for schema versioning and migrations.
- [ ] Iterate Based on FEATURES.md
  - [ ] As new features are prioritized, update schema, RLS, and documentation.

## Current Goal
Seed test data in Supabase (groups, worksheets, etc.) and start frontend integration for new tables.
