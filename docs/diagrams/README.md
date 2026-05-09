# 📐 Diagram Gallery — Startup LaunchPad

All architectural, system design, and planning diagrams for the Startup LaunchPad platform.

---

## System Architecture

### High-Level System Architecture
The three-tier architecture: React.js frontend → Node.js/Express.js API → PostgreSQL database, deployed on a Linux VPS.

![System High-Level Architecture](architecture/System_High_Level_Architecture_Diagram.png)

---

## Database Design

### Entity Relationship Diagram
The complete 23-table normalized relational schema with multi-tenant data isolation. Core entity groups: Identity, Operations, Finance, Talent, Messaging, and System.

![Database ER Diagram](architecture/Database_Entity_Relationship_Diagram.png)

---

## Data Flow Diagrams

### DFD Level 0 — System Context
The top-level context diagram showing the system boundary and primary external actors.

![DFD Level 0](data_flows/Data_Flow_Diagram_Level_0_System_Context.png)

### DFD Level 1 — Main System Flow (Process 1.0)
The primary decomposition showing the 5 main processes within the system.

![DFD Level 1 - 1.0](data_flows/Data_Flow_Diagram_Level_1_Process_1_0.png)

### DFD Level 1 — Operations Module (Process 1.32)
Data flow for the Operations Hub: projects, tasks, subtasks, and activity logs.

![DFD Level 1 - Operations](data_flows/Data_Flow_Diagram_Level_1_Process_1_32.png)

### DFD Level 1 — Financial Module (Process 1.17)
Data flow for the Financial Hub: expense logging, burn rate calculation, and runway estimation.

![DFD Level 1 - Finance](data_flows/Data_Flow_Diagram_Level_1_Process_1_17.png)

### DFD Level 1 — Talent Marketplace (Process 1.6)
Data flow for the Talent Marketplace: gig posting, applications, and hiring.

![DFD Level 1 - Talent](data_flows/Data_Flow_Diagram_Level_1_Process_1_6.png)

### DFD Level 1 — Dashboard & Insights (Process 1.24)
Data flow for the unified dashboard: aggregating operations, finance, and talent data.

![DFD Level 1 - Dashboard](data_flows/Data_Flow_Diagram_Level_1_Process_1_24.png)

### DFD Level 1 — Additional Functional Flow (Process 1.43)
Data flow for additional system processes including notifications and admin functions.

![DFD Level 1 - 1.43](data_flows/Data_Flow_Diagram_Level_1_Process_1_43.png)

---

## System Flow Diagrams

### System Flow 01 — Authentication & Navigation
Complete flow from landing page through registration, login, device verification, and role-based navigation.

![System Flow 01](system_flows/System_Flow_01_Authentication_and_Navigation.png)

### System Flow 02 — Operations Hub (Projects & Tasks)
End-to-end flow for creating projects, managing tasks, updating Kanban status, and logging activity.

![System Flow 02](system_flows/System_Flow_02_Operations_Hub_Projects_Tasks.png)

### System Flow 03 — Financial Hub (Expenses & Burn Rate)
Flow for logging expenses, calculating burn rate, estimating runway, and displaying finance dashboards.

![System Flow 03](system_flows/System_Flow_03_Financial_Hub_Expenses_BurnRate.png)

### System Flow 04 — Talent Marketplace (Hiring)
End-to-end flow from posting an opportunity, receiving applications, reviewing candidates, to onboarding.

![System Flow 04](system_flows/System_Flow_04_Talent_Marketplace_Hiring.png)

### System Flow 05 — Dashboard & AI Insights
Flow for the unified dashboard data aggregation and the planned AI intelligence layer interactions.

![System Flow 05](system_flows/System_Flow_05_Dashboard_and_AI_Insights.png)

### System Flow 06 — Platform Admin Tools
Flow for admin panel operations: user management, CMS, system health monitoring, and security logs.

![System Flow 06](system_flows/System_Flow_06_Platform_Admin_Tools.png)

---

## Use Case Diagrams

### Global System Overview
All actors (Admin, Founder, Team Member, Freelancer) and their interactions with the complete system.

![Use Case - Global](use_cases/Use_Case_Diagram_Global_System_Overview.png)

### Founder & Admin Module
Detailed use cases for the Founder and Admin roles — the primary platform power users.

![Use Case - Founder & Admin](use_cases/Use_Case_Diagram_Founder_and_Admin.png)

### Freelancer Module
Use cases specific to the Freelancer/Talent role — profile management, applications, and messaging.

![Use Case - Freelancer](use_cases/Use_Case_Diagram_Freelancer.png)

---

## Project Planning

### Gantt Chart — Project Timeline (Nov 2025)
The project development timeline showing phases, milestones, and deliverable scheduling.

![Gantt Chart](planning/Project_Timeline_Gantt_Chart_Nov_2025.png)

---

<div align="center">

[← Back to Docs Index](../README.md) &nbsp;·&nbsp; [View Screenshots →](../screenshots/README.md)

</div>
