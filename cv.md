# [YOUR NAME]
Addis Ababa, Ethiopia | [YOUR PHONE NUMBER] | [YOUR EMAIL]
[GitHub Profile Link] | [LinkedIn Link] | [Deployed Project Link]

---

## Professional Summary
Detail-oriented and product-focused Fullstack TypeScript Developer. Ready to ship production-quality code using React, Next.js, Node.js, and PostgreSQL from week one. Proven ability to build non-trivial fullstack applications from database design and API development to responsive client interfaces. Possesses strong self-learning habits, clean coding practices, and experience collaborating with version control (Git).

## Core Technical Skills
- **Languages:** TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3
- **Frontend Development:** React, Next.js (App Router), Tailwind CSS, shadcn/ui, React Hook Form, Lucide React
- **Backend & APIs:** Node.js, Next.js Route Handlers, RESTful API design, HTTP status codes
- **Database & Storage:** PostgreSQL, Supabase, Prisma ORM, SQL schema design
- **Validation & Tooling:** Zod schema validation, Git, npm, Vite, ESLint

---

## Highlighted Portfolio Project: MediQueue
*Fullstack Clinic Queue Management System*
- **Role:** Fullstack TypeScript Engineer (Sole Developer)
- **Codebase:** [Link to GitHub Repository]
- **Live Demo:** [Link to Deployed Application]

### Project Overview
MediQueue is a real-time clinic queue management system built for small clinics. The application streamlines patient check-in workflows for receptionists and provides a centralized console for doctors to view, prioritize, and complete patient consultations in real time.

### Technology Stack Used
- **Frontend:** React (v19) / Next.js (v16 App Router) for optimized rendering and layout structure.
- **Backend APIs:** Next.js Route Handlers (Node.js runtime environment).
- **Database:** Supabase PostgreSQL for relational storage.
- **Styling:** Tailwind CSS and shadcn/ui for a premium, accessible, and responsive design system.
- **Form Handling:** React Hook Form for client-side state control.
- **Validation:** Zod for client-side form safety and server-side request verification.

---

### Code Architecture & Detailed Functionality

#### 1. Relational Database Design (`supabase/schema.sql`)
The database layer is configured on PostgreSQL using relational constraints to ensure data integrity:
- **`Patient` Table:** Stores demographic details: `id`, `fullName`, `age`, `gender`, `phone`, and `createdAt`.
- **`Visit` Table:** Represents patient check-ins with fields: `id`, `patientId`, `queueNumber`, `symptoms`, `status`, and `createdAt`.
- **Relationship:** A one-to-many relationship links `Patient` to `Visit` using a foreign key constraint (`"patientId" REFERENCES "Patient"(id)`).
- **Data Integrity:** Configured with `ON DELETE CASCADE` so that deleting a patient automatically removes all associated consultation history.
- **Status Lifecycle:** Utilizes a custom PostgreSQL enum type (`VisitStatus` with values `WAITING`, `IN_PROGRESS`, `COMPLETED`) to restrict state transitions.

#### 2. Robust Input & API Validation (`lib/validations.ts`)
Unified schemas using Zod validate incoming request bodies on the server and check inputs on the client:
- **`patientSchema`:** Enforces that `fullName` and `gender` are non-empty, and validates `age` as a strict positive integer.
- **`visitCreateSchema`:** Mandates a non-empty string for `symptoms` to prevent registering empty queues.
- **`patientRegisterSchema`:** Merges demographic and symptom schemas to validate the dual registration form.
- **`visitUpdateStatusSchema`:** Restricts status updates to valid enum states (`WAITING`, `IN_PROGRESS`, `COMPLETED`).

#### 3. Next.js REST API Layer (`app/api/`)
RESTful Route Handlers manage all CRUD requests and output appropriate HTTP status codes:
- **Patient Directory (`/api/patients`):**
  - **`GET`**: Fetches all patient profiles. Accepts a `?search=...` query parameter to perform a case-insensitive SQL `ilike` filter on the patient name.
  - **`POST`**: Validates request body using Zod. Inserts a new patient row and returns `201 Created`.
- **Demographic Updates & Deletes (`/api/patients/[id]`):**
  - Uses Next.js 16 conventions to asynchronously resolve path `params` (`Promise<{ id: string }>`).
  - **`GET`**: Fetches a single patient profile joined with their entire historical visits array.
  - **`PUT`**: Modifies demographic records in the database.
  - **`DELETE`**: Deletes the patient row (automatically cascading to wipe associated visits).
- **Daily Queue Management (`/api/visits`):**
  - **`GET`**: Returns today's visits starting from `00:00:00` local time, ordered by `queueNumber` ascending.
  - **`POST`**: Creates a visit for an existing patient. Calculates the daily queue index sequentially by counting visits registered today and assigning `queueNumber = count + 1`.
- **Status Transitions (`/api/visits/[id]`):**
  - **`PATCH`**: Updates the consultation status (e.g., transitions a patient from `WAITING` to `IN_PROGRESS` or `COMPLETED`).
- **Dashboard Stats (`/api/dashboard`):**
  - **`GET`**: Pulls all daily visits and aggregates statuses in-memory to deliver metrics for waiting, active, completed, and total patient counts in a single query.

#### 4. Frontend User Interfaces (`app/` & `components/`)
- **Dashboard Page (`/dashboard`):** Renders dynamic indicator cards showing real-time statistics of today's queue using HSL/OKLCH color themes and responsive grid layouts.
- **Queue Console (`/queue`):** Displays a live data table of today's active patients. Exposes status badge indicators and workflow control buttons (Start Consultation / Complete Consultation) that update state optimistically. Automatically polls the database every 30 seconds to keep terminals in sync.
- **Patient Register Form (`/patients/new`):** Integrates React Hook Form with `zodResolver`. Implements strict type checking, handles loading states during API posts, and automatically routes the user to the queue page upon submission.
- **Directory Search (`/patients`):** A searchable table of all patients. Incorporates inline dialog modals (shadcn `Dialog`) for updating demographic profiles or confirming deletions.

---

## Experience
### Self-Taught Software Development
*Independent Fullstack Engineer* | 2025 - Present
- Built and shipped production-ready web platforms from scratch to validate software engineering skills.
- Implemented robust type safety, API routing, database constraints, and state validation.
- Managed source code, branches, and structured commits using Git.
- Researched documentation for complex framework and package migrations (such as upgrading packages, handling driver adapters, and database transition flows).

---

## Education
### Self-Directed Software Engineering Studies
- Completed advanced curricula covering JavaScript/TypeScript, React state, relational database design, and REST API conventions.
- Built multiple portfolio projects demonstrating clean code and end-to-end implementation.
