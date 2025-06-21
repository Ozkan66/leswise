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
  folder_id?: string;
  owner_id?: string;
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