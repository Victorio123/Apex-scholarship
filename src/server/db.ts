/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { User, Application, Admin } from '../types';

const DB_FILE = path.join(process.cwd(), 'db-storage.json');

interface Schema {
  users: User[];
  applications: Application[];
  admins: Admin[];
}

const DEFAULT_DATA: Schema = {
  users: [],
  applications: [],
  admins: [
    {
      id: 'admin_1',
      email: 'admin@apex.org',
      password: 'admin123' // Simple text password for ease of deployment review
    }
  ]
};

// Ensure database file exists
function readDB(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Schema;
    
    // Ensure admins array has default admin
    if (!parsed.admins || parsed.admins.length === 0) {
      parsed.admins = DEFAULT_DATA.admins;
      writeDB(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database file, returning default data:', error);
    return DEFAULT_DATA;
  }
}

function writeDB(data: Schema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

export const db = {
  // Users Queries & Mutations
  getUsers: (): User[] => {
    return readDB().users;
  },
  
  getUserById: (id: string): User | undefined => {
    return readDB().users.find(u => u.id === id);
  },
  
  getUserByEmail: (email: string): User | undefined => {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  createUser: (user: Omit<User, 'id' | 'created_at'>): User => {
    const data = readDB();
    const newUser: User = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },
  
  // Applications Queries & Mutations
  getApplications: (): Application[] => {
    const database = readDB();
    // Map application user details dynamically for admin ease of use
    return database.applications.map(app => {
      const u = database.users.find(user => user.id === app.user_id);
      return {
        ...app,
        user_name: u ? u.name : 'Unknown Applicant',
        user_email: u ? u.email : 'N/A',
        user_nationality: u ? u.nationality : 'N/A'
      };
    });
  },
  
  getApplicationByUserId: (userId: string): Application | undefined => {
    const apps = db.getApplications();
    return apps.find(app => app.user_id === userId);
  },
  
  getApplicationById: (id: string): Application | undefined => {
    const apps = db.getApplications();
    return apps.find(app => app.id === id);
  },
  
  submitApplication: (appData: Omit<Application, 'id' | 'created_at' | 'score' | 'status' | 'scholarship_type' | 'academic_score' | 'admission_score' | 'statement_score' | 'leadership_score' | 'document_score'>): Application => {
    const data = readDB();
    
    // Check if user already has an application
    const existingIndex = data.applications.findIndex(app => app.user_id === appData.user_id);
    
    const newApp: Application = {
      id: 'app_' + Math.random().toString(36).substring(2, 11),
      user_id: appData.user_id,
      university_name: appData.university_name,
      course: appData.course,
      admission_status: appData.admission_status,
      gpa_or_grade: appData.gpa_or_grade,
      
      // Default scores
      academic_score: 0,
      admission_score: 0,
      statement_score: 0,
      leadership_score: 0,
      document_score: 0,
      score: 0,
      
      status: 'pending',
      scholarship_type: 'none',
      documents: appData.documents,
      created_at: new Date().toISOString()
    };
    
    if (existingIndex > -1) {
      // Overwrite/update existing application
      data.applications[existingIndex] = {
        ...data.applications[existingIndex],
        ...appData,
        // Reset status to pending on re-submission so admin sees it's updated
        status: 'pending',
        reviewed_at: undefined
      };
      writeDB(data);
      return data.applications[existingIndex];
    } else {
      data.applications.push(newApp);
      writeDB(data);
      return newApp;
    }
  },
  
  updateApplicationReview: (
    id: string, 
    reviewData: {
      academic_score: number;
      admission_score: number;
      statement_score: number;
      leadership_score: number;
      document_score: number;
      status: 'pending' | 'under_review' | 'accepted' | 'rejected';
      scholarship_type: 'full' | 'partial' | 'none';
    }
  ): Application | null => {
    const data = readDB();
    const index = data.applications.findIndex(app => app.id === id);
    if (index === -1) return null;
    
    const originalApp = data.applications[index];
    const totalScore = 
      reviewData.academic_score + 
      reviewData.admission_score + 
      reviewData.statement_score + 
      reviewData.leadership_score + 
      reviewData.document_score;
      
    data.applications[index] = {
      ...originalApp,
      academic_score: reviewData.academic_score,
      admission_score: reviewData.admission_score,
      statement_score: reviewData.statement_score,
      leadership_score: reviewData.leadership_score,
      document_score: reviewData.document_score,
      score: totalScore,
      status: reviewData.status,
      scholarship_type: reviewData.scholarship_type,
      reviewed_at: new Date().toISOString()
    };
    
    writeDB(data);
    return data.applications[index];
  },
  
  // Admins Queries & Mutations
  getAdmins: (): Admin[] => {
    return readDB().admins;
  },
  
  getAdminByEmail: (email: string): Admin | undefined => {
    return readDB().admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  },
  
  createAdmin: (email: string, password: string): Admin => {
    const data = readDB();
    const newAdmin: Admin = {
      id: 'adm_' + Math.random().toString(36).substring(2, 11),
      email,
      password
    };
    data.admins.push(newAdmin);
    writeDB(data);
    return newAdmin;
  }
};
