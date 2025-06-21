// Database entity types based on Supabase schema
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  jumper_code: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'leader' | 'member';
  status: 'pending' | 'active';
  joined_at: string;
}

// Extended Group with member role
export interface GroupWithRole extends Group {
  role: 'leader' | 'member';
}

// Supabase query result type for group_members with groups
export interface GroupMemberWithGroup {
  group_id: string;
  role: 'leader' | 'member';
  groups: Group;
}

export interface Folder {
  id: string;
  name: string;
  owner_id: string;
  parent_folder_id?: string;
  created_at: string;
}

export interface Worksheet {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  folder_id?: string;
  is_shared: boolean;
  created_at: string;
}

export interface WorksheetElement {
  id: string;
  worksheet_id: string;
  type: 'text' | 'video' | 'pdf' | 'formula' | 'link';
  content: Record<string, unknown>;
  position: number;
  max_score?: number;
  created_at: string;
}

export interface Submission {
  id: string;
  worksheet_id: string;
  user_id: string;
  created_at: string;
  users?: { email: string }; // For joined queries
}

export interface SubmissionElement {
  id: string;
  submission_id: string;
  worksheet_element_id: string;
  answer: string;
  feedback?: string;
  score?: number;
  created_at: string;
}

// Helper types for common query results
export interface WorksheetWithElements extends Worksheet {
  worksheet_elements?: WorksheetElement[];
}

export interface SubmissionWithUser extends Submission {
  users?: { email: string };
}

export interface SubmissionDetails {
  feedback?: string;
  score?: number;
}