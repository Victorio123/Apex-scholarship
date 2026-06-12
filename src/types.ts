/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  nationality: string;
  created_at: string;
}

export interface DocumentFile {
  name: string;
  type: string;
  base64: string;
}

export interface Application {
  id: string;
  user_id: string;
  user_name?: string; // Derived for admin view
  user_email?: string; // Derived for admin view
  user_nationality?: string; // Derived for admin view
  university_name: string;
  course: string;
  admission_status: 'conditional' | 'unconditional';
  gpa_or_grade: string; // e.g. First Class, Second Class Upper, etc.
  
  // Scoring parameters (Admin defined)
  academic_score: number;       // 0-30
  admission_score: number;      // 0-20
  statement_score: number;      // 0-20
  leadership_score: number;     // 0-15
  document_score: number;       // 0-15
  score: number;                // Total (0-100)
  
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  scholarship_type: 'full' | 'partial' | 'none';
  
  documents: {
    degree_certificate?: DocumentFile;
    transcript?: DocumentFile;
    admission_letter?: DocumentFile;
    cv?: DocumentFile;
    personal_statement?: DocumentFile;
  };
  created_at: string;
  reviewed_at?: string;
}

export interface Admin {
  id: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  admin?: Admin;
}
