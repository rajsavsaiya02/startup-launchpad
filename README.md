<div align="center">
  <h1>🚀 Startup LaunchPad</h1>
  <p><strong>An AI-enhanced operational hub for early-stage startups.</strong></p>

  <p>
    <a href="./docs/PROJECT_AND_REPO_GUIDE.md"><strong>📖 PROJECT AND REPOSITORY GUIDE</strong></a> &nbsp;&nbsp;&middot;&nbsp;&nbsp;
    <a href="./CONTRIBUTING.md"><strong>🤝 Contribution Guide</strong></a> &nbsp;&nbsp;&middot;&nbsp;&nbsp;
  </p>

  ![Project Status](https://img.shields.io/badge/status-in%20development-green)
</div>

---

## 🎯 About The Project

The Indian startup ecosystem is the world's third-largest, yet ~90% of new ventures fail within five years. Our research identifies a primary cause: founders are overwhelmed by **operational inefficiency**, **financial mismanagement**, and **talent acquisition hurdles**.

**Startup LaunchPad** directly attacks these problems by providing a single, integrated, and intelligent platform that consolidates essential business functions into a seamless experience.

### Core Modules

* **📈 Operations Hub:** An intuitive Kanban board for agile project and task management.
* **💰 Financial Hub:** A streamlined expense logger and dashboard to visualise burn rate.
* **🧑‍💻 Talent Marketplace:** A platform for founders to connect with freelance and student talent.

---

## 🛠️ Built With

This project is built on a modern, robust, and scalable technology stack.

* **Frontend:** `React.js`
* **Backend:** `Node.js` with `Express.js`
* **Database:** `PostgreSQL`

---

## 📂 Repository Navigation

This is a **monorepo** containing both our frontend and backend applications. Here is a map to help you find your way around.

```
/startup-launchpad
|
|-- client/          ➡️ React Frontend Application
|-- server/          ➡️ Node.js Backend API
|-- docs/            ➡️ High-Level Project Documentation
|-- .github/         ➡️ Issue & PR Templates
|-- CONTRIBUTING.md  ➡️ Our Contribution Workflow
`-- README.md        ➡️ You are here!
```

---

## 🚀 Getting Started

Follow these steps to set up a local copy for development.

### Prerequisites

* Node.js (v18.x or later)
* PostgreSQL
* `npm` or `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/rajsavsaiya02/startup-launchpad.git](https://github.com/rajsavsaiya02/startup-launchpad.git)
    cd startup-launchpad
    ```

2.  **Set up the Backend (`/server`):**
    ```bash
    cd server
    npm install
    cp .env.example .env
    # ❗️ Important: Open the new .env file and add your database credentials.
    npm run dev
    ```

3.  **Set up the Frontend (`/client`):**
    ```bash
    # Open a new terminal window
    cd client
    npm install
    npm start
    ```

---

## 🏛️ Our Engineering Culture & Guidelines

The success of our project depends on a shared commitment to quality and process. We have two core documents that define our engineering culture. **Reading them is mandatory for all contributors.**

* ### 📖 [The PROJECT AND REPOSITORY GUIDE](./docs/PROJECT_AND_REPO_GUIDE.md)
    This is our "source of truth". It outlines our guiding principles, repository rules, provides a detailed examination of the repository structure, and includes a comprehensive operational checklist for all GitHub activities.

* ### 🤝 [The Contribution Guide](./CONTRIBUTING.md)
    This document provides a concise overview of our branching strategy, commit message standards, and the Pull Request process.

---

## 🗺️ Project Roadmap

We are currently focused on delivering the **Minimum Viable Product (MVP)**, which includes:
-   [ ] Secure User Authentication & Organisation Management
-   [ ] Functional Kanban Board (Operations Hub)
-   [ ] Core Expense Logger (Financial Hub)
