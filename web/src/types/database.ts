// Database entity types for Leswise application

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  email_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  folder_id?: string;
  owner_id?: string;
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

export interface WorksheetElement {
  id: string;
  worksheet_id?: string;
  content: string;
  position?: number;
  type?: string;
  max_score?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  worksheets?: any; // For joins 
  created_at?: string;
  updated_at?: string;
}

export interface Submission {
  id: string;
  worksheet_id?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users?: any; // For joins - flexible to handle different query structures
  feedback?: string;
  score?: number;
}

export interface SubmissionElement {
  id?: string;
  submission_id?: string;
  worksheet_element_id?: string;
  content?: string;
  answer?: string;
  score?: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  jumper_code?: string;
  role?: string; // For joined data
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
  updated_at?: string;
}

// Worksheet sharing types for Epic 2.2
export interface WorksheetShare {
  id: string;
  worksheet_id: string;
  shared_by_user_id: string;
  shared_with_user_id?: string;
  shared_with_group_id?: string;
  permission_level: 'read' | 'submit' | 'edit';
  max_attempts?: number;
  attempts_used: number;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  // Join fields
  worksheets?: Worksheet;
  shared_with_user?: User;
  shared_with_group?: Group;
}

export interface AnonymousLink {
  id: string;
  worksheet_id: string;
  created_by_user_id: string;
  link_code: string;
  max_attempts?: number;
  attempts_used: number;
  expires_at?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Join fields
  worksheets?: Worksheet;
}

export interface AnonymousSubmission {
  id: string;
  anonymous_link_id: string;
  worksheet_id: string;
  participant_name?: string;
  session_id?: string;
  created_at?: string;
  updated_at?: string;
  // Join fields
  anonymous_links?: AnonymousLink;
  worksheets?: Worksheet;
}