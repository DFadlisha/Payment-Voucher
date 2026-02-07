# Payment Voucher Web Application - Migration Plan

## Overview
Convert the existing Electron desktop application to a full-stack web application that can be accessed online by multiple users.

## Requirements Addressed
1. ✅ **PO NUMBER FOR DIFFERENT COMPANY MUST BE SEPARATE** - Already implemented with separate counters
2. ✅ **CHEQUE NO NO NEED TO BE BOLD** - Fixed in this update
3. 🔄 **MAKE IT AS ONLINE SO OTHERS USERS CAN USE** - Implementation plan below

## Technology Stack for Web Version

### Frontend
- **React** (already using) - Keep existing UI components
- **Vite** (already using) - Keep for build tooling
- **Tailwind CSS** (already using) - Keep for styling
- **Lucide React** (already using) - Keep for icons

### Backend
- **Node.js + Express** - API server
- **Firebase** or **Supabase** - Cloud database and authentication
  - Firestore/PostgreSQL for voucher data
  - Firebase Auth/Supabase Auth for user authentication
  - Firebase Storage/Supabase Storage for signature images

### Hosting Options
1. **Frontend**: Vercel, Netlify, or Firebase Hosting
2. **Backend**: Vercel Serverless Functions, Firebase Functions, or Railway
3. **All-in-one**: Firebase (recommended for simplicity)

## Implementation Steps

### Phase 1: Database Migration (Firebase Recommended)

#### 1.1 Setup Firebase Project
```bash
npm install firebase
npm install firebase-admin  # For backend/admin operations
```

#### 1.2 Create Firebase Configuration
- Create Firestore collections:
  - `vouchers` - Store all voucher data
  - `settings` - Store PV counters per company
  - `users` - Store user information and permissions

#### 1.3 Data Structure
```javascript
// Firestore Collections

// vouchers/{voucherId}
{
  pv_number: "MI-0001",
  company: "mentari",
  date: "2026-02-07",
  pay_to: "John Doe",
  payment_method: "cheque",
  cheque_number: "123456",
  bank_name: "",
  total_amount: 1500.00,
  items: [
    { description: "...", invNo: "...", amount: 500.00 }
  ],
  prepared_by: "Alice",
  approved_by: "Bob",
  received_by: "John",
  prepared_sig: "gs://bucket/signatures/...",  // Storage URL
  approved_sig: "gs://bucket/signatures/...",
  received_sig: "gs://bucket/signatures/...",
  created_at: timestamp,
  updated_at: timestamp,
  created_by: "user_id"  // For audit trail
}

// settings/pv_counters
{
  mentari: 1,
  nes: 1
}

// users/{userId}
{
  email: "user@example.com",
  name: "User Name",
  role: "admin" | "user",
  company_access: ["mentari", "nes"],  // Which companies they can create vouchers for
  created_at: timestamp
}
```

### Phase 2: Authentication System

#### 2.1 Add Firebase Authentication
```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### 2.2 Create Login Component
- Email/Password authentication
- Google Sign-In (optional)
- Password reset functionality

#### 2.3 Protected Routes
- Wrap main app with authentication check
- Redirect to login if not authenticated

### Phase 3: Update Application Logic

#### 3.1 Replace IPC Calls with Firebase Operations
```javascript
// Old (Electron IPC)
const result = await ipcRenderer.invoke('save-voucher-db', voucherData);

// New (Firebase)
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload signatures to Firebase Storage
const uploadSignature = async (base64Data, voucherId, type) => {
  const blob = await fetch(base64Data).then(r => r.blob());
  const storageRef = ref(storage, `signatures/${voucherId}/${type}.png`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};

// Save voucher
const saveVoucher = async (voucherData) => {
  const vouchersRef = collection(db, 'vouchers');
  
  // Upload signatures
  const prepared_sig = voucherData.preparedSig 
    ? await uploadSignature(voucherData.preparedSig, voucherData.pvNumber, 'prepared')
    : null;
  
  const doc = {
    pv_number: voucherData.pvNumber,
    company: voucherData.company,
    // ... other fields
    prepared_sig,
    created_at: serverTimestamp(),
    created_by: auth.currentUser.uid
  };
  
  await addDoc(vouchersRef, doc);
};
```

#### 3.2 Implement Real-time Updates (Optional)
```javascript
import { onSnapshot } from 'firebase/firestore';

// Listen for voucher updates
useEffect(() => {
  const q = query(collection(db, 'vouchers'), orderBy('created_at', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const vouchers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setVouchers(vouchers);
  });
  
  return () => unsubscribe();
}, []);
```

### Phase 4: PDF Generation

#### 4.1 Client-Side PDF Generation
Since we can't use Electron's printToPDF, use a library:

```bash
npm install jspdf html2canvas
# OR
npm install @react-pdf/renderer
```

#### 4.2 Alternative: Server-Side PDF Generation
```bash
npm install puppeteer
```

Create an API endpoint for PDF generation:
```javascript
// api/generate-pdf.js (Vercel Serverless Function)
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { html } = req.body;
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
}
```

### Phase 5: Excel Export

Keep existing XLSX library, but handle client-side:
```javascript
import * as XLSX from 'xlsx';

const exportToExcel = (vouchers) => {
  const worksheet = XLSX.utils.json_to_sheet(vouchers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vouchers');
  XLSX.writeFile(workbook, `vouchers-${Date.now()}.xlsx`);
};
```

### Phase 6: User Management & Permissions

#### 6.1 Admin Dashboard
- User management (add/remove users)
- Assign company access permissions
- View all vouchers across companies
- Reset PV counters (with confirmation)

#### 6.2 Role-Based Access Control
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Vouchers
    match /vouchers/{voucherId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.resource.data.company in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company_access;
      allow update, delete: if request.auth != null && 
        (resource.data.created_by == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Settings (PV counters)
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Phase 7: Deployment

#### 7.1 Environment Variables
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 7.2 Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Or deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## Migration Checklist

- [ ] Set up Firebase project
- [ ] Configure Firebase Authentication
- [ ] Create Firestore database structure
- [ ] Set up Firebase Storage for signatures
- [ ] Create login/signup components
- [ ] Replace all IPC calls with Firebase operations
- [ ] Implement PDF generation (client or server-side)
- [ ] Update Excel export for client-side
- [ ] Add user management system
- [ ] Configure Firestore security rules
- [ ] Set up environment variables
- [ ] Test all features
- [ ] Deploy to hosting platform
- [ ] Set up custom domain (optional)
- [ ] Train users on new system

## Estimated Timeline

- **Phase 1-2** (Database + Auth): 2-3 days
- **Phase 3** (Update Logic): 2-3 days
- **Phase 4-5** (PDF + Excel): 1-2 days
- **Phase 6** (User Management): 2-3 days
- **Phase 7** (Deployment): 1 day
- **Testing & Refinement**: 2-3 days

**Total**: 10-15 days

## Cost Estimation (Firebase Free Tier)

- **Firestore**: 50K reads, 20K writes, 20K deletes per day (FREE)
- **Authentication**: Unlimited (FREE)
- **Storage**: 5GB storage, 1GB/day downloads (FREE)
- **Hosting**: 10GB storage, 360MB/day bandwidth (FREE)

For most small businesses, Firebase free tier is sufficient. Paid plans start at $25/month if needed.

## Next Steps

Would you like me to:
1. Start implementing the Firebase migration?
2. Create a simpler version with just frontend changes (no backend)?
3. Explore alternative solutions (Supabase, custom backend)?

Let me know how you'd like to proceed!
