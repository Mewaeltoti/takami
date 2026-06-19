# MediQueue

MediQueue is a professional clinic queue management system designed for small clinics. It facilitates patient registration by the reception staff, automatically assigns daily queue numbers, and provides a real-time console for doctors to manage and check out active consultations.

## Features

- **Clinic Dashboard:** Live metric cards showing waiting patients, active consultations, completed checkups, and total registrations for today.
- **Patient Directory:** A searchable database table of registered patients. Supports modifying patient demographic details and deleting profiles.
- **Queue Console:** A live-updating view of today's patients. Provides action controls for starting and completing consultations.
- **Demographics & Symptom Intake:** Integrated intake form utilizing form validation and automatic queue assignment.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Database Client:** Supabase Client (`@supabase/supabase-js`)
- **Database:** Supabase PostgreSQL
- **Form & Validation:** React Hook Form & Zod

## Folder Structure

```txt
├── app/
│   ├── api/
│   │   ├── dashboard/       # Clinic statistics API
│   │   ├── patients/        # Directory list & registration API
│   │   │   └── [id]/        # Details, update, delete patient API
│   │   └── visits/          # Queue list & visit creation API
│   │       └── [id]/        # Update visit status API
│   ├── dashboard/           # Main clinic overview page
│   ├── doctors/             # Route redirecting to queue console
│   ├── patients/            # Patient directory page
│   │   └── new/             # Registration intake form page
│   └── queue/               # Live queue management page
├── components/
│   ├── layout/              # Common layouts (e.g. Navbar)
│   └── ui/                  # shadcn/ui components (e.g. Button, Table)
├── lib/
│   ├── supabase.ts          # Supabase client singleton initialization
│   └── validations.ts       # Zod schemas for input validation
├── supabase/
│   └── schema.sql           # Database schema SQL creation script
├── types/
│   └── index.ts             # Shared TypeScript type definitions
└── README.md
```

## How to Run Locally

### 1. Prerequisites
- Node.js (v18.x or later recommended)
- A Supabase account and database project

### 2. Setup Environment Variables
Create a `.env` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Initialize the Database Schema
Execute the DDL script found in [supabase/schema.sql](supabase/schema.sql) in the Supabase **SQL Editor** to create the tables and type definitions:
1. Log in to the Supabase dashboard.
2. Select your project and navigate to the **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and click **Run**.

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoint Documentation

### Patients
- `GET /api/patients` - List patients. Optional query filter: `?search=name`.
- `POST /api/patients` - Register a patient profile.
- `GET /api/patients/[id]` - Retrieve a patient and their historical visits.
- `PUT /api/patients/[id]` - Update patient demographic details.
- `DELETE /api/patients/[id]` - Delete a patient profile (cascades and deletes associated visits).

### Visits / Queue
- `GET /api/visits` - List today's queue visits sorted by queue number.
- `POST /api/visits` - Create a visit for an existing patient. Calculates next queue number.
- `PATCH /api/visits/[id]` - Update a visit's status. Accepts `{"status": "WAITING" | "IN_PROGRESS" | "COMPLETED"}`.

### Dashboard
- `GET /api/dashboard` - Get daily clinic statistics.

## Architecture Explanation

MediQueue separates concerns across clear architecture layers:
1. **Database Layer:** Supabase PostgreSQL storage with relational constraints (foreign keys and cascade deletions).
2. **Server-Side API Layer:** Built using Next.js Route Handlers with async parameter resolution. Integrates Zod for request validation and outputs correct HTTP status codes.
3. **Validation Layer:** Zod schemas in `lib/validations.ts` serve as the single source of truth for both server-side API requests and client-side form submissions.
4. **Client UI Components:** Fully responsive pages designed with Tailwind CSS and shadcn/ui. State management utilizes React Hook Form.

## Git Commits

Suggested commit history:

- initialize project structure
- configure supabase connection settings
- add patient registration flow
- implement queue management
- add dashboard statistics
- refine validation and error handling
- prepare application for deployment
