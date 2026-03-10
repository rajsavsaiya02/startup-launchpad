# Startup LaunchPad - Core Features To-Do List (2-Day Sprint)

This document outlines the pending core features required to finalize the Alpha/MVP version of Startup LaunchPad, strictly constrained to an intensive 2-day development window. The tasks are deep, specific, and categorized by user type.

---

## 1. Admin (System & Platform Oversight)

**Objective:** Ensure platform stability, content control, and user governance.

- [ ] **System Health Dashboard Visualization**
  - **Task:** Integrate `ECharts` in the Admin Dashboard (`admin/dashboard`) to display real-time server metrics (CPU usage, Memory allocation, API response times) fetched from a new Node.js system metric route.
- [ ] **Dynamic Content Management (CMS) Finalization**
  - **Task:** Finalize the backend CRUD controllers and frontend forms for `Blogs`, `Case Studies`, and `Legal/Policy` pages. Ensure the React-Quill (or similar) rich text editor is fully operational and storing clean HTML in PostgreSQL.
- [ ] **User Suspension & Session Termination**
  - **Task:** Add a "Suspend User" action in the Admin End User Management table. Connect this to a backend route that toggles an `is_active` boolean in the DB and immediately invalidates/blacklists their active JWT tokens using Redis.
- [ ] **Dynamic Navigation Menu Management**
  - **Task:** Complete the UI for `Admin Page Management Panel` to allow admins to reorder or hide public navigation links, saving the configuration to the `system_settings` table (JSONB column).

---

## 2. Founder (Organization & Project Management)

**Objective:** Enhance financial oversight, operational bootstrapping, and real-time awareness.

- [ ] **Financial Data Export (CSV/PDF)**
  - **Task:** Implement utility functions in the Financial Hub (`finance/dashboard`) allowing founders to download the current view of expense logs and burn-rate tables as formatted CSV and PDF reports.
- [ ] **Rule-Based Financial Anomaly Detection**
  - **Task:** Write a Node.js background cron job or controller logic that scans daily expenses. If a logged expense exceeds 30% of the calculated average monthly burn, flag it by inserting an alert record, and display a prominent warning banner on the founder's Financial Dashboard.
- [ ] **Project Template Cloning**
  - **Task:** Add a "Clone Project" button next to existing projects. This backend route should duplicate the target project's metadata, Kanban board structure (columns), and settings, but exclude the actual tasks and assigned talent, allowing for rapid operational setup.
- [ ] **Escrow/Milestone Payment Intent (UI Only)**
  - **Task:** Build the frontend UI component in the Talent Project view allowing founders to define a payment milestone, laying the groundwork for future payment gateway integration.

---

## 3. Student/Freelancer (Talent & Execution)

**Objective:** Improve gig discoverability, profile presentation, and communication.

- [ ] **Tag-Based Gig Recommendation Engine**
  - **Task:** Modify the `Find Gigs` API response to sort and highlight available gigs whose required skill tags heavily intersect with the freelancer's profile skill array.
- [ ] **Deliverable/Milestone Submission Interface**
  - **Task:** In the `Project Work Board`, add a "Submit Deliverable" modal to specific assigned tasks. Allow the freelancer to attach a file (AWS S3/DigitalOcean Space) or URL, changing the task status to "Awaiting Founder Review".
- [ ] **In-Project Direct Messaging (WebSocket)**
  - **Task:** Implement a lightweight `Socket.io` chat drawer scoped to specific projects/tasks so the assigned freelancer can chat directly with the project founder regarding requirements without leaving the Kanban page.
- [ ] **Enhanced Public Profile Assets**
  - **Task:** Update the `User Profile Page` to allow PDF Resume uploads. Ensure these URLs are securely accessible and display a distinct "View Resume" button to founders reviewing gig applications.

---

## 4. Normal User (General Experience & Onboarding)

**Objective:** Smooth onboarding, preference management, and application clarity.

- [ ] **Interactive First-Time Onboarding Tour**
  - **Task:** Integrate a library like `driver.js` or `react-joyride` to create a 4-step guided tour that triggers automatically when a user views the `Operations Hub`/`Kanban Board` for the very first time (tracked via a boolean in user settings).
- [ ] **Notification Preference Center**
  - **Task:** Build a `Settings` tab where users can toggle preferences (e.g., "Receive Email on Task Assignment", "In-App Alert on Application Update"). Ensure the backend Notification Service respects these boolean flags before dispatching.
- [ ] **Email Template Dispatch Integration**
  - **Task:** Connect the backend notification triggers (e.g., "Welcome to Startup LaunchPad", "You've been assigned a Gig") to a transactional email provider (like SendGrid or Nodemailer) using the HTML templates mentioned in the documentation.
- [ ] **Universal Global Search Modal**
  - **Task:** Implement a CMD+K (or CTRL+K) triggered modal using Mantine UI that allows users to quickly search for Projects, Gigs, or User Profiles across the platform, fetching results from an optimized search endpoint.
