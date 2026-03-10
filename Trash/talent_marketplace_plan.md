# Talent Marketplace Implementation Plan

## 1. Overview

The Talent Marketplace is a comprehensive hiring and networking platform connecting Startups/Organizations with Talent. It will facilitate three distinct types of work:

1. **Gigs/Freelance Work:** Short-term, task-specific outsourcing designed to save money. Targeted at Freelancers.
2. **Internships:** Role-based work with a specific duration, primarily for Students seeking opportunities.
3. **Job Openings:** Full-time employment for Normal Users and graduated students/freelancers.

Additionally, the platform functions as a talent showcase (similar to LinkedIn) where **all users** (Founders, Freelancers, Students, Normal Users) have **Public Profiles** that can be shared externally to demonstrate their skills, experience, and past work on the platform.

Currently, the UI exists as passive components (`GigListPage`, `GigDetailsPage`, `GigApplicationsPage`, `FreelancerProfilePage`) but the backend does not exist. We will build the backend, integrate it with the frontend, and ensure search/filter, applying, reviewing, messaging, archiving, and public profile functionalities all work smoothly.

---

## 2. Backend Implementation (Node.js/Express & PostgreSQL)

### 2.1 Database Schema Updates (`server/src/scripts/initDb.js`)

We will create the following tables avoiding raw SQL manually where possible but integrating them into `initDb.js`:

- **`opportunities` (formerly `gigs`) Table:**

  - `id`: Primary Key
  - `project_id`: Foreign Key to `projects` (Optional, as general Jobs might not belong to a specific project)
  - `organization_id`: Foreign Key to `organizations` (The hiring company)
  - `owner_id`: Foreign Key to `users` (The founder/manager posting it)
  - `type`: String ('gig', 'internship', 'job')
  - `title`: String
  - `description`: Text
  - `skills`: Text[] (Array of skills for tag matching)
  - `compensation_type`: String ('Fixed', 'Hourly', 'Unpaid', 'Stipend', 'Salary')
  - `budget_min`, `budget_max`: Numeric (for Gigs/Jobs) / Stipend Amount (for Internships)
  - `status`: String ('Open', 'Closed', 'Filled')
  - `duration`: String (e.g., '1 Week' for Gig, '3 Months' for Internship, 'Full-time' for Job)
  - `created_at`, `updated_at`
- **`opportunity_applications` Table:**

  - `id`: Primary Key
  - `opportunity_id`: Foreign Key to `opportunities`
  - `freelancer_id`: Foreign Key to `users`
  - `cover_letter`: Text
  - `proposed_rate`: Numeric
  - `status`: String ('Pending', 'Shortlisted', 'Accepted', 'Rejected')
  - `created_at`, `updated_at`
- **`opportunity_messages` Table:**

  - `id`: Primary Key
  - `application_id`: Foreign Key to `opportunity_applications`
  - `sender_id`: Foreign Key to `users`
  - `content`: Text
  - `created_at`: Timestamp
- **`opportunity_archives` Table:**

  - `id`: Primary Key
  - `application_id`: Foreign Key to `opportunity_applications` (The accepted application)
  - `archived_by_founder`: Boolean (Default True when moved to archive)
  - `archived_by_freelancer`: Boolean (Default True when moved to archive)
  - `founder_deleted`: Boolean (Default False)
  - `freelancer_deleted`: Boolean (Default False)
  - `archived_at`: Timestamp
  - *(Note: If both `founder_deleted` and `freelancer_deleted` become true, the record and associated chats can be permanently deleted)*

*(Note: Public Profiles will leverage the existing `users` table fields: `bio`, `skills`, `public_profile` JSONB, `avatar`, `social_linkedin`, `social_github`, `social_website`. We do not need a new table for profiles, just dedicated endpoints and a robust UI to display them.)*

### 2.2 Controllers (`server/src/controllers/talentController.js`)

- `createOpportunity`: Allows a founder/manager to post a gig, internship, or job.
- `getAllOpportunities`: Retrieves all open opportunities. Will support query parameters for search, filtering by type ('gig' vs 'internship' vs 'job'), skills/tags, and compensation type.
- `getOpportunityById`: Retrieves a single opportunity and its details.
- `applyForOpportunity`: Allows a talent (freelancer/student/normal user) to apply.
- `getOpportunityApplications`: Allows a founder to view all applications for a specific opportunity.
- `updateApplicationStatus`: Founder accepting/rejecting an applicant. Triggers auto-assignment logic. Also moves accepted applications into the `opportunity_archives`.
- `getPublicProfile`: Fetch any user's public profile data using their generic identifier (e.g., username or ID), making it accessible to anyone with the link.
- `updatePublicProfile`: Endpoint for users to update their own `public_profile` JSONB data (work experience, education, portfolio links).
- **Messaging Controllers:**
  - `sendMessage`: Save a new message linked to an application.
  - `getApplicationMessages`: Retrieve chat history for an application.
- **Archive Controllers:**
  - `getArchives`: Fetch archived opportunities for the logged-in user (Founder or Freelancer).
  - `deleteFromArchive`: Soft-deletes the archive for the user; if both parties soft-delete, it triggers a hard permanent delete of the archive and its chat history.

### 2.3 Routes (`server/src/routes/talentRoutes.js`)

- `POST /api/talent/opportunities` (Protect, Organization/Founder/Manager only)
- `GET /api/talent/opportunities` (Protect)
- `GET /api/talent/opportunities/:id` (Protect)
- `POST /api/talent/opportunities/:id/apply` (Protect, Talent role)
- `GET /api/talent/opportunities/:id/applications` (Protect, Organization/Founder/Manager only)
- `PUT /api/talent/applications/:id/status` (Protect, Organization/Founder/Manager only)
- `GET /api/talent/profile/:username` (Public or Protect - decides if profiles are truly public to the web or just logged-in users)
- `PUT /api/talent/profile/me` (Protect, self-update)
- `POST /api/talent/applications/:id/messages` (Protect, specific to participants)
- `GET /api/talent/applications/:id/messages` (Protect, specific to participants)
- `GET /api/talent/archives` (Protect)
- `DELETE /api/talent/archives/:id` (Protect)
- Register this route in `server/src/routes/index.js`.

---

## 3. Frontend Implementation (React/Vite)

### 3.1 API Services Integration

- Create API service handlers in `client/src/services/` (e.g., `talentApi.js`) exporting methods to interact with the endpoints above.

### 3.2 State Management (TanStack Query)

- Hook up React Query in the Talent pages to fetch data asynchronously with loading and error states.

### 3.3 UI Component Wiring & Role Delineation

The UI will be strictly segmented based on whether the user is viewing it as **Talent** (Freelancer, Student, Normal User) or as an **Organization** (Founder, Manager). [Use Google Stich Tool to make perfect Desing ]

#### A. Talent View (Freelancers, Students, Normal Users)

*These roles share a common interface for seeking opportunities and showcasing themselves.*

- **`OpportunitiesBoardPage.jsx`:**
  - A unified board to browse API data.
  - Tabs/Filters to switch between Gigs, Internships, and Jobs. Role nuances apply (e.g., Normal Users might default to seeing Jobs, Students to Internships).
- **`OpportunityDetailsPage.jsx`:**
  - Shows the details and an "Apply Now" mechanism taking a `cover_letter` and relevant metadata.
- **`PublicProfilePage.jsx`:**
  - A beautiful, rich showcase page (like LinkedIn). Given a `:username` param, it fetches their `bio`, `skills`, and portfolio items from `public_profile`.
  - Includes a "Share" button to copy the public URL.
- **`MyApplicationsPage.jsx`:**
  - A dashboard for the talent to track the status of applications they've submitted ('Pending', 'Shortlisted', etc.).

#### B. Organization View (Founders, Managers)

*Completely separate, management-focused interface.*

- **`ManageOpportunitiesPage.jsx`:**
  - A dashboard listing all Gigs, Internships, and Jobs posted by their organization.
  - Includes "Create New Posting" functionalities.
- **`ApplicationReviewPage.jsx`:**
  - Fetch applications for their specific opportunity.
  - View applicant's `PublicProfilePage.jsx` in a drawer or new tab.
  - Include "Accept" and "Reject" buttons triggering the status update API.

#### C. Shared Components (Both Roles)

- **Chat/Messaging Modal:**
  - Contextual chat to exchange messages before/after accepting.
- **`TalentArchivePage.jsx`:**
  - A page to view successful past engagements in a simplified format, with access to their old chat history.
  - Includes a "Delete" button that permanently removes the record for the user viewing it.

---

## 4. Verification Plan

- **Backend verification:** Create the tables, seed mock data covering all three opportunity types (Gig, Internship, Job), and test endpoints. Testing `public_profile` JSONB structures.
- **Frontend verification:** Log in as a Founder -> Post a Job & Gig. Log out, log in as Normal User -> Apply to Job. Log in as Freelancer -> Apply to Gig. Check Public Profile sharing. Log back in as Founder -> Review & Accept. Check Chat and Archives.

---

Let me know if you approve of this plan, and I will proceed strictly following it!
