# Startup LaunchPad: Organization Implementation Guide

## Overview
This document serves as the core reference for the Organization subsystem in Startup LaunchPad. The organization feature allows collaborative workspaces where multiple users can manage projects, tasks, and gigs together. 

## Architectural Principles
To ensure robust, reliable, and scalable features, this module strictly adheres to the following principles:
1. **ACID Properties:** All critical multi-step database operations (e.g., creating an organization and assigning the initial founder) are enclosed in database transactions to guarantee Atomicity, Consistency, Isolation, and Durability.
2. **SOLID Principles:** Backend logic is modularized. Controllers handle HTTP layer logic, Services handle business rules, and Models/Queries handle database interactions.
3. **Data & Functional Integrity:** Robust input validation using Joi/Zod, along with strict relational constraints in PostgreSQL (e.g., cascading deletes, unique indices), ensures data consistency.

## Core Data Models & ERD Dependencies
Based on our Database ERD, the organization structure relies on three core entities:
1. **Organization:** Represents the workspace. Contains settings like timezone, active subscription plan, and logo.
2. **OrganizationDesignations:** Represents the organizational chart (e.g. Roles/Titles). Captures `department`, financial attributes (`base_salary_band`), and hierarchy constraints (`hierarchy_level`).
3. **OrganizationMembers:** Represents a User's assignment to an Organization space. Tracks `is_active`, `joined_at`, their financial `hourly_cost_rate`, reporting structure (`manager_member_id`), explicit `org_role` (for RBAC privileges), and their specific `designation_id`.

## Core Rules & Constraints
- **One-to-One Founder Mapping:** A user with the global role `founder` can establish **only one** Organization.
- **Single Membership:** A user can be an active member (`is_active: true`) of **only one** Organization at any given time.
- **Mandatory Authentication:** Users must be verified and logged in before interacting with any organizational process.

## Role-Based Access Control (RBAC) & Hierarchy
Within an organization, granular permissions are granted using a strict role system, augmenting the standard reporting lines built via `manager_member_id`:

| Role | Description & Authority |
|---|---|
| **FOUNDER** | Ultimate authority. Can manage billing, subscriptions, finalize the org structures, and manage all underlying roles (including Admins). Cannot be kicked. |
| **ADMIN** | High-level management. Can invite/approve/kick Members. Can manage OrganizationDesignations across departments. Cannot manage the Founder. |
| **MEMBER** | Standard collaborative internal employee. Tracks progress, logs time/expenses, participates in internal conversations. Associated with specific Designations and Cost Rates. |
| **GUEST (Freelancer/Intern)**| Restricted access external worker. Interacts strictly through the confines of their assigned "Gig". Cannot browse broader org projects or financial data unless explicitly assigned. |

### Organization Master Password (Master Key)
The organization password (initially set during creation) acts as a **Master Key** for highly sensitive administrative tasks. 
- **Mandatory for Deletion**: Deleting an organization requires both an email OTP and the correct Master Password verification.
- **OTP-Protected Updates**: The Master Password can only be changed via an email OTP flow.
- **7-Day Security Block**: For enhanced account security, an organization cannot be deleted for **7 days** after the Master Password has been changed. This prevents an attacker from instantly wiping an organization even if they hijack the Master Key.
- **Role Restriction**: Only the `FOUNDER` of the organization has authority over the Master Password.

## Features & Workflows
1. **Creation:** A global `founder` navigates to the Org Landing Page to establish their organization.
2. **Joining System (Secure)**: A user joins by entering a valid 64-character `join_code`. If the organization has enabled a Master Password, it must also be provided to complete the join process.
3. **Leaving/Kicking:** Members can securely leave an organization at any time. Higher-authority roles can kick lower-authority roles, instantly revoking access and session tokens associated with the org.
4. **Landing Page:** Users without an organization see a specific landing page providing essential details about organization features, alongside options to join or create (if applicable).

## Future Scalability
This architectural foundation is designed to eventually support multi-organization memberships per user and multiple organizations per founder, though restricted currently for system simplicity and stability.

## Testing & Seed Data
To facilitate comprehensive testing of the Organization features, a seed script is provided (\`server/src/scripts/seedOrganizations.js\`).
Running this script (\`node src/scripts/seedOrganizations.js\`) will:
1. Create a dummy organization ("Acme Corp").
2. Pre-populate 32 distinct designations across various departments (Engineering, HR, Sales, etc.).
3. Generate 56 user profiles (1 Founder, 5 Admins, 40 Members, 10 Guests) that are automatically attached to the organization with pre-verified emails.
4. Output an autogenerated spreadsheet (\`docs/organization_accounts.csv\`) containing all testing credentials (Email, Password, Name, System Role, Organization Role, Department, and Designation).
All dummy test accounts use the password: \`Password123!\`
