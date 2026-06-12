/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use increased limit for base64 file payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper middleware to get current user/admin from authorization header
  const getAuthEntity = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    
    if (token.startsWith('token_usr_')) {
      const userId = token.replace('token_usr_', '');
      const user = db.getUserById(userId);
      return user ? { role: 'user', entity: user } : null;
    } else if (token.startsWith('token_adm_')) {
      const adminId = token.replace('token_adm_', '');
      const admins = db.getAdmins();
      const admin = admins.find(a => a.id === adminId);
      return admin ? { role: 'admin', entity: admin } : null;
    }
    return null;
  };

  // Auth: Register User
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, nationality } = req.body;
    
    if (!name || !email || !password || !nationality) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Nationalities allowed: Nigeria or Ghana, Tunisia, Kenya, Gambia
    const allowedNationalities = ['nigeria', 'ghana', 'tunisia', 'kenya', 'gambia'];
    if (!allowedNationalities.includes(nationality.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Applicant must be a citizen of Nigeria, Ghana, Tunisia, Kenya, or Gambia.' 
      });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    try {
      const user = db.createUser({
        name,
        email,
        password, // Simple text storage meets development server sandbox specification
        nationality
      });
      
      const token = `token_usr_${user.id}`;
      // Strip password before returning
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        message: 'Registration successful!',
        token,
        role: 'user',
        user: userWithoutPassword
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
    }
  });

  // Auth: Universal Login (handles applicants and admins)
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Check if it's Admin login first
    const admin = db.getAdminByEmail(email);
    if (admin && admin.password === password) {
      const token = `token_adm_${admin.id}`;
      const { password: _, ...adminWithoutPassword } = admin;
      return res.json({
        success: true,
        message: 'Admin login successful!',
        token,
        role: 'admin',
        admin: adminWithoutPassword
      });
    }

    // Check if it's User login
    const user = db.getUserByEmail(email);
    if (user && user.password === password) {
      const token = `token_usr_${user.id}`;
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        role: 'user',
        user: userWithoutPassword
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  });

  // Auth: Get Profile
  app.get('/api/auth/me', (req, res) => {
    const auth = getAuthEntity(req);
    if (!auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized session.' });
    }

    if (auth.role === 'admin') {
      const { password: _, ...adminWithoutPassword } = auth.entity as any;
      return res.json({ success: true, role: 'admin', admin: adminWithoutPassword });
    } else {
      const { password: _, ...userWithoutPassword } = auth.entity as any;
      return res.json({ success: true, role: 'user', user: userWithoutPassword });
    }
  });

  // User: Submit or Update Application
  app.post('/api/application/submit', (req, res) => {
    const auth = getAuthEntity(req);
    if (!auth || auth.role !== 'user') {
      return res.status(401).json({ success: false, message: 'Unauthorized applicant session.' });
    }

    const { 
      university_name, 
      course, 
      admission_status, 
      gpa_or_grade, 
      documents 
    } = req.body;

    if (!university_name || !course || !admission_status || !gpa_or_grade || !documents) {
      return res.status(400).json({ success: false, message: 'All application fields are required.' });
    }

    // Approved universities and courses validation
    const approvedUniversities = [
      'University of Exeter (UK)',
      'York St John University (UK)',
      'University of Hull (UK)',
      'University of Salford (UK)',
      'teeside university',
      'Uni of Manitoba',
      'Uni of Saskatchewan',
      'Uni of Alberta',
      'Charles Darwin University',
      'University of Southern Queensland (UniSQ)',
      'University of the Sunshine Coast'
    ];
    
    const approvedCourses = [
      'Engineering',
      'Business Administration',
      'Law',
      'Computer Science',
      'Medicine',
      'Nursing'
    ];

    if (!approvedUniversities.includes(university_name)) {
      return res.status(400).json({ success: false, message: 'Selected university is not approved by the committee.' });
    }

    if (!approvedCourses.includes(course)) {
      return res.status(400).json({ success: false, message: 'Selected course is not eligible for state sponsorship.' });
    }

    try {
      const app = db.submitApplication({
        user_id: auth.entity.id,
        university_name,
        course,
        admission_status,
        gpa_or_grade,
        documents
      });

      return res.json({
        success: true,
        message: 'Scholarship application successfully submitted!',
        application: app
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error submitting application.' });
    }
  });

  // User: Get active application
  app.get('/api/application/me', (req, res) => {
    const auth = getAuthEntity(req);
    if (!auth || auth.role !== 'user') {
      return res.status(401).json({ success: false, message: 'Unauthorized applicant session.' });
    }

    const application = db.getApplicationByUserId(auth.entity.id);
    if (!application) {
      return res.json({ success: true, application: null });
    }
    return res.json({ success: true, application });
  });

  // Admin: Get all applications
  app.get('/api/admin/applications', (req, res) => {
    const auth = getAuthEntity(req);
    if (!auth || auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden admin action.' });
    }

    const list = db.getApplications();
    return res.json({ success: true, applications: list });
  });

  // Admin: Review & Score Application
  app.post('/api/admin/applications/:id/review', (req, res) => {
    const auth = getAuthEntity(req);
    if (!auth || auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden admin action.' });
    }

    const { id } = req.params;
    const { 
      academic_score, 
      admission_score, 
      statement_score, 
      leadership_score, 
      document_score,
      status,
      scholarship_type 
    } = req.body;

    if (
      academic_score === undefined || 
      admission_score === undefined ||
      statement_score === undefined ||
      leadership_score === undefined ||
      document_score === undefined ||
      !status ||
      !scholarship_type
    ) {
      return res.status(400).json({ success: false, message: 'All score inputs, status, and scholarship assigned tier are required.' });
    }

    try {
      const updated = db.updateApplicationReview(id, {
        academic_score: Number(academic_score),
        admission_score: Number(admission_score),
        statement_score: Number(statement_score),
        leadership_score: Number(leadership_score),
        document_score: Number(document_score),
        status,
        scholarship_type
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Application record not found.' });
      }

      return res.json({
        success: true,
        message: 'Application score evaluation and decision was published successfully!',
        application: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating review score.' });
    }
  });

  // Admin: Seed Mock Application Data (for evaluation ease)
  app.post('/api/seed', (req, res) => {
    try {
      const mockUsers = [
        { name: 'Adekunle Alao', email: 'adekunle@gmail.com', password: 'password123', nationality: 'Nigeria' },
        { name: 'Chinedu Okeke', email: 'chinedu@gmail.com', password: 'password123', nationality: 'Nigeria' },
        { name: 'Kofi Mensah', email: 'kofi@gmail.com', password: 'password123', nationality: 'Ghana' },
        { name: 'Fatoumata Diallo', email: 'fatoumata@gmail.com', password: 'password123', nationality: 'Gambia' }
      ];

      const currentUsers = db.getUsers();
      const currentApps = db.getApplications();

      // Clear if requested to reset or only seed if empty
      const seededUsers = [];
      for (const mUser of mockUsers) {
        let existing = db.getUserByEmail(mUser.email);
        if (!existing) {
          existing = db.createUser(mUser);
        }
        seededUsers.push(existing);
      }

      // Seed mock applications
      const samplePdfBase64 = 'JVBERi0xLjQKJSDi48clb3V0bGluZQoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMiAwIG9iagogPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggMzIgPj4Kc3RyZWFtCkJUIApMUi9GMSAxMiBUZiAKNTAgNzAwIFREIAooTW9jayBEb2N1bWVudCBQREYgQ29udGVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago=';

      const mockApplications = [
        {
          user_id: seededUsers[0].id,
          university_name: 'University of Exeter (UK)',
          course: 'Engineering',
          admission_status: 'unconditional' as const,
          gpa_or_grade: 'First Class (4.82 / 5.0)',
          documents: {
            degree_certificate: { name: 'Certificate_Alao.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            transcript: { name: 'Transcript_Alao.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            admission_letter: { name: 'Offer_Exeter.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            cv: { name: 'CV_Alao.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            personal_statement: { name: 'Statement_Alao.pdf', type: 'application/pdf', base64: samplePdfBase64 }
          }
        },
        {
          user_id: seededUsers[1].id,
          university_name: 'University of Salford (UK)',
          course: 'Computer Science',
          admission_status: 'conditional' as const,
          gpa_or_grade: 'Second Class Upper (4.20 / 5.0)',
          documents: {
            degree_certificate: { name: 'Certificate_Chinedu.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            transcript: { name: 'Transcript_Chinedu.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            admission_letter: { name: 'Offer_Salford.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            cv: { name: 'CV_Chinedu.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            personal_statement: { name: 'Statement_Chinedu.pdf', type: 'application/pdf', base64: samplePdfBase64 }
          }
        },
        {
          user_id: seededUsers[2].id,
          university_name: 'Uni of Manitoba',
          course: 'Business Administration',
          admission_status: 'unconditional' as const,
          gpa_or_grade: 'First Class',
          documents: {
            degree_certificate: { name: 'Degree_Mensah.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            transcript: { name: 'Transcript_Mensah.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            admission_letter: { name: 'Offer_Manitoba.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            cv: { name: 'CV_Mensah.pdf', type: 'application/pdf', base64: samplePdfBase64 },
            personal_statement: { name: 'Statement_Mensah.pdf', type: 'application/pdf', base64: samplePdfBase64 }
          }
        }
      ];

      for (const mApp of mockApplications) {
        const app = db.submitApplication(mApp);
        
        // Let's seed pre-reviewed statuses so the admin dashboard is beautiful immediately
        if (mApp.university_name.includes('Exeter')) {
          db.updateApplicationReview(app.id, {
            academic_score: 28,
            admission_score: 19,
            statement_score: 18,
            leadership_score: 14,
            document_score: 15,
            status: 'accepted',
            scholarship_type: 'full'
          });
        } else if (mApp.university_name.includes('Salford')) {
          db.updateApplicationReview(app.id, {
            academic_score: 22,
            admission_score: 15,
            statement_score: 16,
            leadership_score: 11,
            document_score: 12,
            status: 'under_review',
            scholarship_type: 'none'
          });
        }
      }

      return res.json({ success: true, message: 'Seeded sample applicant records successfully!' });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message || 'Error seeding database.' });
    }
  });

  // Vite middleware for development or serving index.html in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server fully configured at http://0.0.0.0:${PORT}`);
  });
}

startServer();
