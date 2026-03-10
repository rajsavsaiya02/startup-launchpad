<div align="center">
  <h1>🚀 Startup LaunchPad: Project & Repository Guide</h1>
  <p><strong>Version: 1.0 | Last Updated: October 9, 2025</strong></p>
</div>

---

## 🎯 1. Project Vision & Mission

Welcome to the **Startup LaunchPad** project! This document is the single source of truth for our team, outlining the project's mission, technical standards, and development workflow. Following these guidelines is key to our collective success.

> **Our Mission:** To address the critical challenges of **operational inefficiency**, **financial mismanagement**, and **talent acquisition** that cause most startups to fail. We are building a single, integrated, and intelligent platform that empowers early-stage founders to manage their ventures effectively and increase their chances of success.

> **Our Engineering Philosophy:** We prioritize **clean, maintainable code**, **collaborative workflows**, and **quality control**. Every developer contributes to a unified codebase, where consistency, clear communication, and quality are non-negotiable. We believe in continuous improvement, ensuring our process and codebase grow stronger over time.

---

## 🛠️ 2. Technical Architecture & Stack

Our application is built on a modern, robust, and scalable technology stack.

* **Frontend:** `React.js`
* **Backend:** `Node.js` with `Express.js`
* **Database:** `PostgreSQL`

---

## 📂 3. Repository Structure (Monorepo)

We use a **monorepo** structure, which means the frontend and backend codebases live together in this single repository.

```
/startup-launchpad
|
|-- .github/               # GitHub-specific files (templates)
|-- client/                # React Frontend Application
|-- server/                # Node.js Backend Application
|-- docs/                  # Project Documentation (this file, ERDs, etc.)
|-- .gitignore             # Files and folders to be ignored by Git
|-- CONTRIBUTING.md        # Guidelines for how to contribute
`-- README.md              # The main project README file
```

-   **`client/`**: Contains the complete React application. See its internal `README.md` for setup instructions.
-   **`server/`**: Contains the complete Node.js API. See its internal `README.md` for setup instructions.

---

## 🌿 4. Branching Strategy & Workflow

Our workflow is designed for agility and stability, ensuring our `main` branch is always clean.

### Core Branches

* `main` 🛡️: **Production Branch**. Always stable and deployable. Protected.
* `develop` 🏗️: **Integration Branch**. This is our main development branch. All new work starts and ends here.

### The Developer's Journey 🗺️

Follow these steps for every new feature or bug fix.

**1. 🔄 Sync Your Local `develop` Branch**
Before starting anything, make sure your local `develop` branch is up-to-date.
```bash
git checkout develop
git pull origin develop
```

**2. 🌱 Create a New Feature Branch**
Create a new branch from `develop`. Use a descriptive name.
```bash
# For a new feature:
git checkout -b feature/user-login-api

# For a bug fix:
git checkout -b bugfix/password-validation-error
```

**3. 💻 Write Code & Commit Often**
Make your changes and commit your work in small, logical chunks using our commit message convention (see Section 5).
```bash
git add .
git commit -m "feat: implement user registration endpoint"
```

**4. 🚀 Push Your Branch to GitHub**
```bash
git push -u origin feature/user-login-api
```

**5. 💬 Open a Pull Request (PR)**
On GitHub, open a PR from your `feature/...` branch to `develop`.
-   Fill out the PR template completely.
-   Request a review from at least one other team member.

**6. ✅ Merge and Clean Up**
Once your PR is approved and passes all checks, merge it into `develop`. You can then delete your feature branch.

---

## ✍️ 5. Commit Message Convention

We use **Conventional Commits** to maintain a clean and readable version history.

| Type       | Description                                                 |
| :--------- | :---------------------------------------------------------- |
| **`feat`** | A new feature for the user.                                 |
| **`fix`** | A bug fix for the user.                                     |
| `docs`     | Changes to documentation.                                   |
| `style`    | Formatting changes, white-space, etc.                       |
| `refactor` | Code changes that neither fix a bug nor add a feature.      |
| `test`     | Adding or correcting tests.                                 |
| `chore`    | Updating build tasks, package manager configs, etc.         |

**Example:**
```
feat: add user logout functionality to navbar
```

---

## 🗺️ 6. Project Roadmap: Minimum Viable Product (MVP)

Our MVP focuses on delivering the most crucial features for early-stage founders:

### User & Organization Management
- Secure user signup, login, and session management.
- Founders can create organizations for their startups.

### Operations Hub (Kanban Board)
- Create projects and tasks.
- Drag-and-drop tasks between columns (`To Do`, `In Progress`, `Done`).

### Financial Hub (Expense Logger)
- Log business expenses with categories.
- Basic dashboard to view total and category-specific spending.

> **Note:** This guide is a living document. As we build, we will continuously improve our processes and the product itself.

---

## 🏛️ 7. Repository & Codebase Guidelines

These rules are designed to protect the integrity of the codebase and ensure a high-quality product.

### 1. The `develop` Branch is Sacred
- All new work must start in a feature branch forked from `develop`. Direct commits to `develop` are not suggested.

### 2. No Code Merges Without a Pull Request (PR)
- All code must enter `develop` via a PR. This ensures code is reviewed, discussed, and tested before merging.

### 3. Every PR Requires at Least One Approval
- A PR cannot be merged until it has been reviewed and approved by at least one team member.

### 4. "It Works on My Machine" is Not a Valid Excuse
- All code must be tested to ensure it works in a clean environment.

### 5. Leave the Code Better Than You Found It
- Always improve small things while working on a feature, such as renaming a poorly named variable or clarifying a comment.

### 6. Security is Everyone's Responsibility
- Never commit sensitive data like API keys or database credentials. 
- Use `.env` files for sensitive information, which are ignored by Git.

---

## ✅ 8. GitHub Operational Checklist & Workflow

A structured checklist for contributing code.

### Pre-Flight Checklist (Before You Code)
1. **Sync with the Latest Code**
   - Ensure your local `develop` branch is up-to-date.

2. **Create Your Feature Branch**
   - Create a descriptive feature branch for your task.

3. **Install Dependencies**
   - Ensure all dependencies are installed for the project.

### Coding & Committing Workflow
1. **Write Your Code**
   - Implement the functionality or fix as needed.

2. **Commit Frequently and Logically**
   - Commit small, logical changes frequently with meaningful messages.

3. **Follow the Conventional Commit Standard**
   - Adhere to the predefined commit message convention (e.g., `feat`, `fix`, `docs`).

### Pull Request & Code Review Checklist
1. **Push Your Branch**
   - Push the changes to your remote feature branch.

2. **Create the Pull Request**
   - Set the target branch to `develop`.
   - Complete the PR template.
   - Assign at least one reviewer for the PR.

3. **Code Review**
   - Ensure the code works as expected.
   - Check for readability and maintainability.
   - Ensure consistency with established patterns.

4. **Merging the PR**
   - After approval, use "Squash and Merge" on GitHub to keep the history clean.
   - Delete the feature branch after merging.

---
Notes on Formatting:
I've used headings (like ##, ###) for the sections and subsections.

Lists are formatted using - or 1. for numbered points.

Added blockquotes (>) where notes are provided to make them stand out.
