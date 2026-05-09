# 🎓 MCA Project Viva — Preparation Guide
### Project: **Startup LaunchPad** | 10-Minute Viva | 4 Members

> **Role:** Expert Viva Examiner Simulation  
> **Format:** Question → Short, accurate, direct answer  
> **Coverage:** Introduction · Modules · Technical Stack · System Design · Features · Practical & Common

---

## 📌 SECTION 1 — Project Introduction

---

**Q1. What is the title of your project?**  
> **A:** Startup LaunchPad — An AI-enhanced operational hub for early-stage startups.

---

**Q2. What is the main objective of your project?**  
> **A:** To provide a single, integrated platform that helps early-stage startups manage their operations, finances, and talent in one place — reducing management overhead and increasing their chances of success.

---

**Q3. What problem does your project solve?**  
> **A:** ~90% of Indian startups fail within five years due to operational inefficiency, financial mismanagement, and talent acquisition challenges. Our system directly addresses all three problems in a unified platform.

---

**Q4. Who are the target users of your system?**  
> **A:** Early-stage startup founders, their team members (employees, team leads), and external talent like freelancers and students looking for gig opportunities.

---

**Q5. Why did you choose this project topic?**  
> **A:** India has the world's third-largest startup ecosystem, but most tools are either too expensive or too scattered. We saw a real need for an affordable, all-in-one platform specifically designed for early-stage founders.

---

**Q6. What is the full form or meaning of "LaunchPad" in your project name?**  
> **A:** LaunchPad represents a launch surface — just like a rocket needs a launchpad to take off, our platform gives startups the foundational tools they need to launch and sustain their business.

---

**Q7. What is the current status of your project?**  
> **A:** The project is in active development. The MVP (Minimum Viable Product) is being built, covering user authentication, the Kanban-based Operations Hub, and the Financial Hub expense logger.

---

## 📌 SECTION 2 — Project Modules

---

**Q8. What are the main modules of your project?**  
> **A:** Three core modules:
> 1. **Operations Hub** — Kanban-based project and task management
> 2. **Financial Hub** — Expense logging and burn rate visualization
> 3. **Talent Marketplace** — Connecting startups with freelancers and students

---

**Q9. Explain the Operations Hub module.**  
> **A:** It is a Kanban board system where founders can create projects and tasks, then drag-and-drop tasks across columns — `To Do`, `In Progress`, and `Done` — to track progress in real time.

---

**Q10. Explain the Financial Hub module.**  
> **A:** It allows team members to log business expenses with categories like salaries, marketing, and tools. A dashboard visualizes total spending, burn rate, and category-wise breakdown using charts (Apache ECharts).

---

**Q11. Explain the Talent Marketplace module.**  
> **A:** Organizations post gig opportunities (short-term jobs). Freelancers and students can browse these, apply, and chat with the organization. The org can shortlist, review, accept, or reject applicants.

---

**Q12. What is the Organization module and why is it important?**  
> **A:** The Organization module is the backbone of the system. A founder creates an organization workspace, invites members via a join code, and assigns roles. All modules (Operations, Finance, Talent) operate within this organization context.

---

**Q13. What are the roles inside an organization?**  
> **A:** Six roles — `FOUNDER`, `CO-FOUNDER`, `ADMIN`, `TL (Team Lead)`, `EMPLOYEE`, and `GUEST`. Each has specific permissions, for example, the Founder has ultimate authority and cannot leave their own organization.

---

**Q14. Which module did you personally work on?**  
> **A:** *(Each member should answer with their own module — e.g., "I worked on the Talent Marketplace module, specifically the gig posting, application, and messaging features.")*

---

**Q15. What is the Community module?**  
> **A:** It is an additional module allowing users on the platform to interact, share posts, and build a network — similar to a lightweight LinkedIn feed within the platform.

---

## 📌 SECTION 3 — Technical Stack

---

**Q16. Which technologies did you use in your project?**  
> **A:** 
> - **Frontend:** React.js with Vite, Mantine UI, Tailwind CSS
> - **Backend:** Node.js with Express.js
> - **Database:** PostgreSQL
> - **State Management:** TanStack Query (server state) + Redux Toolkit (client state)
> - **Auth:** JWT + Passport.js (Google, GitHub OAuth)

---

**Q17. Why did you choose React.js for the frontend?**  
> **A:** React offers a component-based architecture, making UI reusable and maintainable. Its virtual DOM ensures fast UI updates, and the large ecosystem (Mantine, TanStack, Redux) fits our needs perfectly.

---

**Q18. Why did you choose Node.js for the backend?**  
> **A:** Node.js is non-blocking and event-driven, making it highly efficient for real-time features like WebSocket notifications and high-concurrency API calls. It also allows us to use JavaScript across both frontend and backend.

---

**Q19. What is the role of Express.js?**  
> **A:** Express.js is a minimal web framework on top of Node.js. It handles HTTP routing, middleware chaining (auth, logging, error handling), and organizes API endpoints in a structured way.

---

**Q20. Why did you choose PostgreSQL?**  
> **A:** PostgreSQL is a robust relational database that supports ACID transactions, which are critical for operations like creating an organization and assigning a founder atomically. It also supports complex joins and relational integrity with cascading deletes.

---

**Q21. What is Vite and why did you use it instead of Create React App?**  
> **A:** Vite is a modern build tool that is significantly faster than Create React App. It uses native ES modules in development, so the dev server starts almost instantly. Production builds use Rollup for optimized output.

---

**Q22. What is JWT and how is it used in your project?**  
> **A:** JWT (JSON Web Token) is a compact, self-contained token used for user authentication. After login, the server issues a JWT stored in an HTTP-only cookie. Each API request sends this token, and the backend verifies it via the `protect` middleware.

---

**Q23. What is Passport.js and why did you use it?**  
> **A:** Passport.js is an authentication middleware for Node.js. We used it to support OAuth login via Google and GitHub, so users don't need to create a separate password — they can log in with their existing accounts.

---

**Q24. What is bcrypt and how is it used?**  
> **A:** bcrypt is a password hashing library. Before storing a user's password in the database, we hash it using bcrypt so that even if the database is compromised, the actual passwords remain secure.

---

**Q25. What is Multer used for?**  
> **A:** Multer is a middleware for handling file uploads in Node.js (multipart/form-data). We use it for uploading profile avatars and other file assets to the server's storage.

---

## 📌 SECTION 4 — System Design & Architecture

---

**Q26. What is the architecture of your system?**  
> **A:** We follow a **3-tier architecture**: 
> 1. **Presentation Layer** — React frontend (client/)
> 2. **Application Layer** — Node.js + Express REST API (server/)
> 3. **Data Layer** — PostgreSQL database
>
> It is a **monorepo** — both frontend and backend live in the same repository.

---

**Q27. How does the frontend communicate with the backend?**  
> **A:** Through RESTful HTTP APIs using Axios as the HTTP client. TanStack Query manages data fetching, caching, and synchronization. For real-time updates (notifications, chat), we use Socket.io WebSockets.

---

**Q28. What is an API? What type of API did you build?**  
> **A:** API stands for Application Programming Interface. It is a set of rules allowing two systems to communicate. We built a **RESTful API**, where each endpoint corresponds to a resource (e.g., `/api/org`, `/api/projects`, `/api/talent`) and uses standard HTTP methods (GET, POST, PUT, DELETE).

---

**Q29. What is REST?**  
> **A:** REST (Representational State Transfer) is an architectural style for APIs. It is stateless, uses standard HTTP methods, and organizes resources via URLs. Each request is independent and contains all necessary information.

---

**Q30. How does data get stored in the database?**  
> **A:** The backend controllers receive API requests, run business logic in service functions, and then execute parameterized SQL queries (via the `pg` library) to read or write data in PostgreSQL tables.

---

**Q31. How does the Kanban board work in your system?**  
> **A:** Tasks are stored in the database with a `status` field (To Do, In Progress, Done) and a sort `order`. The frontend uses `@dnd-kit` library for drag-and-drop. When a card is dropped in a new column, an API call updates the task's status and order in the database.

---

**Q32. What is CORS and how did you handle it?**  
> **A:** CORS (Cross-Origin Resource Sharing) is a browser security rule that blocks requests from different origins. We configured the Express server with an allowed origins list (localhost:5173, 5174, etc.) so the React frontend can freely call the backend API.

---

**Q33. What is Helmet.js and why is it used?**  
> **A:** Helmet.js is a security middleware for Express that sets various HTTP response headers (like X-Content-Type, X-Frame-Options) to protect the app against common web vulnerabilities like clickjacking and MIME-type sniffing.

---

**Q34. What is middleware in Express.js?**  
> **A:** Middleware is a function that sits between an HTTP request and the route handler. It has access to the request and response objects. Examples in our project: `protect` (authentication check), `cors`, `helmet`, `morgan` (logging), `multer` (file upload).

---

**Q35. What is Role-Based Access Control (RBAC) and how is it implemented?**  
> **A:** RBAC restricts system access based on a user's role. In our project, we have org roles (FOUNDER, ADMIN, TL, EMPLOYEE, GUEST). The `requireOrgRole` middleware checks the user's role from the database before allowing or denying API access.

---

**Q36. What is Morgan and what does it do?**  
> **A:** Morgan is an HTTP request logger middleware for Node.js. It logs every incoming request (method, URL, status code, response time) in the "combined" format, and we stream those logs to our custom logger utility.

---

**Q37. What is a monorepo and why did you use it?**  
> **A:** A monorepo is a single repository containing multiple projects (frontend + backend). We used it to simplify version control, share documentation, and make cross-cutting changes (like API contracts) easier to manage in one place.

---

## 📌 SECTION 5 — Features

---

**Q38. What authentication methods does your system support?**  
> **A:** Three methods:
> 1. **Email/Password** — with OTP email verification
> 2. **Google OAuth** — via Passport.js Google strategy
> 3. **GitHub OAuth** — via Passport.js GitHub strategy

---

**Q39. What is OTP verification and why is it used?**  
> **A:** OTP (One-Time Password) is a temporary code sent to the user's email. We use it for email verification during registration and for sensitive operations like changing the organization master password. It ensures the user actually owns the email address.

---

**Q40. What is device verification in your system?**  
> **A:** When a user logs in from an unrecognized device, the system sends a verification OTP to their email before granting access. This adds an extra layer of security similar to two-factor authentication.

---

**Q41. How does the expense tracking system work?**  
> **A:** Organization members can log an expense with a title, amount, category, and date. These are stored in the database. The Financial Hub dashboard then aggregates this data and displays charts showing total spend, burn rate, and category-wise distribution using Apache ECharts.

---

**Q42. How can freelancers apply for gigs?**  
> **A:** Freelancers browse the public Opportunities Board. They click on a gig, view the details, and submit an application with a cover message. The organization's team receives the application and can update its status (pending → shortlisted → accepted/rejected) and chat with the applicant.

---

**Q43. How does the shortlisting system work?**  
> **A:** Organization Admins/Founders can mark any freelancer's profile as "shortlisted" via a toggle API. Shortlisted profiles appear in a dedicated list inside the Talent Hub. Freelancers can also see which organizations have shortlisted them.

---

**Q44. What is the Organization Join Code system?**  
> **A:** Each organization has a unique 64-character join code. New members enter this code on the join page to request access. If the organization has a master password, they must also provide it — this prevents unauthorized joins.

---

**Q45. What is the Organization Master Password?**  
> **A:** It is a high-security password set by the Founder during organization creation. It is required for sensitive operations like deleting the organization. Additionally, after changing the master password, there is a 7-day security block preventing deletion — to stop attackers who may have hijacked the key.

---

**Q46. What is the AI layer in your project?**  
> **A:** The AI layer is a planned analytical enhancement that processes operational and financial data to provide insights — such as predicting budget overruns, suggesting task prioritization, or flagging anomalies in expense patterns. It is positioned as a smart assistant layer on top of the existing modules.

---

**Q47. What type of analysis does the AI layer perform?**  
> **A:** Descriptive and predictive analysis — analyzing expense trends, project velocity from the Kanban board, and talent pipeline data to help founders make better business decisions.

---

**Q48. How does real-time messaging work in the Talent module?**  
> **A:** Using Socket.io WebSockets. When an organization sends a message to an applicant (or vice versa), it is emitted as a socket event and received in real time on the other end, without needing to refresh the page.

---

**Q49. How does your system help startups manage work efficiently?**  
> **A:** It centralizes three critical functions — project tasks (Kanban), expense tracking (Finance Hub), and hiring (Talent Marketplace) — into one platform. Founders no longer need to juggle multiple disconnected tools like Trello, Excel, and LinkedIn separately.

---

**Q50. What is the SEO middleware in your backend?**  
> **A:** Since we serve the React frontend from the Node.js server, we built an SEO middleware that injects dynamic meta tags (title, description, Open Graph tags) into the HTML before sending it to the browser. This gives Search Engine bots meaningful page data instead of a blank React shell.

---

## 📌 SECTION 6 — Practical Implementation

---

**Q51. What challenges did you face during development?**  
> **A:** Key challenges included:
> - Designing a complex RBAC system with 6 roles across the org module
> - Implementing atomic multi-step operations using PostgreSQL transactions (e.g., org creation + founder assignment)
> - Real-time drag-and-drop Kanban state sync with the backend
> - Managing OAuth 2.0 flows for both Google and GitHub authentication

---

**Q52. How did you solve those challenges?**  
> **A:** 
> - RBAC: Used database-level role checks via middleware
> - Atomic operations: Wrapped multi-step DB queries in SQL `BEGIN`/`COMMIT/ROLLBACK` transactions (ACID)
> - Kanban sync: Used optimistic UI updates locally + API patch calls for persistence
> - OAuth: Used Passport.js strategies that abstract the OAuth flow

---

**Q53. What is ACID in the context of your database?**  
> **A:** ACID stands for Atomicity, Consistency, Isolation, and Durability. In our project, when we create an organization and assign a founder, both steps are wrapped in a database transaction — if one fails, the entire operation rolls back. This ensures data integrity.

---

**Q54. What is the SOLID principle and how did you apply it?**  
> **A:** SOLID is a set of software design principles. In our backend:
> - **Controllers** handle only HTTP layer logic (request/response)
> - **Services** handle business rules
> - **Database queries** are isolated separately
> This separation of concerns makes the code maintainable and testable.

---

**Q55. How did you manage environment variables and sensitive data?**  
> **A:** All sensitive data (database credentials, JWT secrets, OAuth client IDs) are stored in `.env` files, which are listed in `.gitignore` and never committed to the repository. We provide a `.env.example` file as a template for new developers.

---

**Q56. What testing did you implement?**  
> **A:** We have:
> - **Database tests** — `db_connection_test.js` and `db_crud_test.js` (in `/Tests/Database`)
> - **Email tests** — verify nodemailer email sending
> - **Unit testing** — Vitest on the frontend; Jest on the backend
> - **Storybook** — for isolated UI component development and visual testing

---

**Q57. What improvements would you add in the future?**  
> **A:** 
> - Full AI-powered analytics dashboard
> - Mobile app (React Native)
> - Subscription/payment integration (Razorpay or Stripe)
> - Multi-organization support per user
> - Advanced reporting and CSV/PDF export for financial data

---

**Q58. What are the advantages of your system compared to existing tools?**  
> **A:** Unlike Trello (only tasks) or QuickBooks (only finance), our system unifies operations, finance, and talent in one place. It is specifically designed for Indian early-stage startups — affordable, integrated, and built with an organization-first mindset.

---

**Q59. If your project becomes a real product, how would you scale it?**  
> **A:** 
> - Use **PM2** or **Docker** for process management and containerization
> - Add a **load balancer** (Nginx) in front of multiple Node.js instances
> - Migrate to **managed PostgreSQL** (AWS RDS or Supabase)
> - Use **Redis** for session caching and rate limiting
> - Implement **CDN** for static asset delivery

---

**Q60. What is your deployment plan?**  
> **A:** The project is deployed on a **Linux VM server** (as documented in `docs/VM Server Detail.pdf`). The backend serves the React build as static files (SSR-like), and PostgreSQL runs on the same or a managed server. We use SSH key-based access (`startupvm_key.pem`) for secure server management.

---

## 📌 SECTION 7 — Common / General Questions

---

**Q61. What is a Kanban board?**  
> **A:** Kanban is an agile project management method that uses a board with columns representing stages of work (To Do, In Progress, Done). Tasks (cards) move across columns as work progresses, giving a real-time visual overview of the project status.

---

**Q62. What is the difference between frontend and backend?**  
> **A:** The **frontend** is what the user sees and interacts with in the browser (React UI). The **backend** is the server-side application that processes business logic, handles authentication, and manages the database (Node.js + Express + PostgreSQL).

---

**Q63. What is the difference between `npm install` and `npm run dev`?**  
> **A:** `npm install` downloads all project dependencies listed in `package.json` into the `node_modules` folder. `npm run dev` starts the development server (Vite for frontend, Nodemon for backend).

---

**Q64. What is the difference between SQL and NoSQL databases?**  
> **A:** SQL databases (like PostgreSQL) store structured data in tables with defined schemas and support complex joins and transactions. NoSQL databases (like MongoDB) store flexible, document-based data and are better for unstructured or rapidly changing data. We chose PostgreSQL because our data is relational and requires ACID compliance.

---

**Q65. What is a foreign key?**  
> **A:** A foreign key is a column in a table that references the primary key of another table, creating a relationship between them. For example, `OrganizationMembers.user_id` references `Users.id` — ensuring a member must be a valid user.

---

**Q66. What is Git branching strategy? What did you follow?**  
> **A:** We followed a `main` + `develop` branching strategy. The `main` branch is always production-ready. All new features are developed in `feature/` branches forked from `develop`, and merged back via Pull Requests after code review.

---

**Q67. What are Conventional Commits?**  
> **A:** Conventional Commits is a commit message convention. Prefixes like `feat:`, `fix:`, `docs:`, `refactor:` make the commit history readable and enable automated changelog generation. Example: `feat: add user logout functionality`.

---

**Q68. What is a Pull Request (PR)?**  
> **A:** A PR is a request to merge code from one branch to another on GitHub. It allows team members to review the code, leave comments, suggest changes, and approve before the code is merged — ensuring quality control.

---

**Q69. What is `nodemon` and why is it used?**  
> **A:** Nodemon is a development tool that automatically restarts the Node.js server whenever a file is saved/changed. It eliminates the need to manually stop and restart the server during development.

---

**Q70. What is the difference between `GET`, `POST`, `PUT`, and `DELETE` in REST APIs?**  
> **A:** 
> - `GET` — Retrieve data (e.g., get all projects)
> - `POST` — Create new data (e.g., create a new task)
> - `PUT` — Update existing data (e.g., update task status)
> - `DELETE` — Remove data (e.g., delete a gig opportunity)

---

**Q71. What is TanStack Query and why is it better than `useEffect` for API calls?**  
> **A:** TanStack Query (React Query) is a server-state management library. Unlike raw `useEffect`, it automatically handles caching, background refetching, loading/error states, and stale data invalidation. This reduces boilerplate and prevents race conditions.

---

**Q72. What is Redux Toolkit? How is it different from TanStack Query?**  
> **A:** Redux Toolkit manages **client-side state** — things like user auth status, UI toggles, and permissions stored globally. TanStack Query manages **server state** — data fetched from APIs. They serve different purposes and are used together in our project.

---

**Q73. What is `useEffect` in React?**  
> **A:** `useEffect` is a React hook that runs side effects (like API calls, subscriptions, DOM manipulation) after a component renders. It accepts a dependency array — effects re-run when those dependencies change.

---

**Q74. What is `useState` in React?**  
> **A:** `useState` is a React hook that allows a functional component to hold local state. When state changes, React re-renders the component to reflect the updated value.

---

**Q75. What is Framer Motion and where did you use it?**  
> **A:** Framer Motion is a React animation library. We use it for smooth page transitions, micro-animations on hover, and animated modal/drawer appearances — improving the overall user experience with a premium feel.

---

**Q76. What is ECharts and where is it used?**  
> **A:** Apache ECharts (via `echarts-for-react`) is a data visualization library. We use it in the Financial Hub to render bar charts, pie charts, and line graphs showing expense breakdowns, burn rate, and spending trends.

---

**Q77. What is `socket.io` used for in your project?**  
> **A:** Socket.io enables real-time bidirectional communication using WebSockets. In our Talent Marketplace, it powers the live messaging system — messages between organizations and applicants are sent and received in real time without page refresh.

---

**Q78. What is the difference between a monorepo and a multi-repo?**  
> **A:** A **monorepo** keeps all codebases in a single Git repository (what we use — `/client` + `/server` in one repo). A **multi-repo** puts each service in its own repository. Monorepos simplify dependency management and coordination in early-stage projects.

---

**Q79. What is Storybook and how did you use it?**  
> **A:** Storybook is a tool for developing and visually testing UI components in isolation, outside the full app. We used it to build and review UI components (buttons, cards, modals) individually before integrating them into pages.

---

**Q80. What security measures did you implement?**  
> **A:** 
> - **Helmet.js** — Secure HTTP headers
> - **bcrypt** — Password hashing
> - **JWT in HTTP-only cookies** — Prevents XSS token theft
> - **CORS whitelist** — Only allowed origins can call the API
> - **`.env` files** — No hardcoded secrets
> - **Input validation** — Via Joi/Zod on the backend
> - **Device verification OTP** — For suspicious logins
> - **7-day security block** — Post master password change

---

## 📌 SECTION 8 — Financial Formulas (Runway Estimator)

> 🖼️ *This section is based on the **Runway Estimator** feature in the Financial Hub — a "Startup Survival Metrics" card showing Estimated Runway in months.*

---

**Q81. What is the Runway Estimator in your project?**
> **A:** It is a feature in the Financial Hub that calculates how many months a startup can survive (its "runway") before running out of money, based on their current cash balance and monthly spending rate.

---

**Q82. What is the formula for Estimated Runway?**
> **A:**
> ```
> Runway (months) = Total Available Cash ÷ Monthly Burn Rate
> ```
> Example: If a startup has ₹38 Lakhs cash and burns ₹1 Lakh/month → Runway = **38 months**

---

**Q83. What is Burn Rate?**
> **A:** Burn Rate is the rate at which a company spends its cash reserves. It is calculated as:
> ```
> Monthly Burn Rate = Total Expenses in a Period ÷ Number of Months
> ```
> Example: ₹3 Lakhs spent in 3 months → Burn Rate = ₹1 Lakh/month

---

**Q84. What is the difference between Gross Burn Rate and Net Burn Rate?**
> **A:**
> ```
> Gross Burn Rate = Total monthly expenses (all spending)
> Net Burn Rate   = Monthly expenses − Monthly revenue
> ```
> Net Burn Rate is more useful for startups that have begun earning revenue. We use **Gross Burn Rate** in our system (expense-only, as the startup is pre-revenue stage).

---

**Q85. What is Cash Runway and why is it important for startups?**
> **A:** Cash Runway tells a founder exactly how many months they have left before the company runs out of money. It is critical because it helps founders decide when to raise funds, cut costs, or pivot. A typical healthy early-stage runway is **18–24 months**.

---

**Q86. How does your system calculate the Monthly Burn Rate from expense data?**
> **A:** The system fetches all logged expenses from the database, groups them by month, and computes the average monthly spend:
> ```
> Monthly Burn Rate = SUM(all expenses) ÷ Number of active months tracked
> ```
> This is then used in the runway formula. The accuracy depends on how consistently the team logs their expenses.

---

**Q87. What does "projected liabilities" mean in the Runway Estimator tooltip?**
> **A:** Projected liabilities are future financial obligations the startup is committed to but hasn't paid yet — like upcoming salaries, vendor invoices, or rent. Including them gives a more accurate (and conservative) runway estimate than just looking at cash spent.

---

**Q88. What does "liquid assets" mean in the context of the Runway Estimator?**
> **A:** Liquid assets are funds immediately accessible — typically cash in the bank, not assets like equipment or real estate. The Runway Estimator uses liquid assets as the "Total Available Cash" in its formula, since only liquid cash can actually pay operational expenses.

---

**Q89. What is the formula for Total Expenses by Category?**
> **A:**
> ```
> Category Total = SUM(expense_amount) WHERE category = 'X'
> ```
> Example:  
> - Salaries: ₹50,000  
> - Marketing: ₹20,000  
> - Tools/SaaS: ₹5,000  
> This is shown as a pie chart in the Financial Hub dashboard.

---

**Q90. What is the formula for Burn Rate Trend (month-over-month)?**
> **A:**
> ```
> MoM Change (%) = ((Current Month Spend − Previous Month Spend) ÷ Previous Month Spend) × 100
> ```
> A positive % means spending is increasing (bad sign). A negative % means the startup is cutting costs (good sign). This is visualized as a line graph in the Financial Hub.

---

**Q91. Why does the system say "Accuracy depends on precise project-level budget logging"?**
> **A:** The runway calculation is only as good as the data entered. If team members skip logging expenses, the burn rate will appear lower than it really is, giving a falsely optimistic runway. The system reminds users that complete and accurate expense logging is essential for meaningful metrics.

---

**Q92. What is the formula to check if a startup is overspending vs. budget?**
> **A:**
> ```
> Budget Variance = Actual Spend − Planned Budget
> ```
> - Positive variance → Over budget (spending more than planned)  
> - Negative variance → Under budget (spending less than planned)  
> This can be shown per project or per category in the Financial Hub.

---

> 💡 **Tip for 4 members:** Divide the sections between members.
> - Member 1 → Sections 1 & 2 (Introduction + Modules)
> - Member 2 → Sections 3 & 4 (Tech Stack + System Design)
> - Member 3 → Sections 5 & 8 (Features + Financial Formulas)
> - Member 4 → Sections 6 & 7 (Practical + Common)
>
> Each member must also know their own module deeply and be ready for follow-up questions.
