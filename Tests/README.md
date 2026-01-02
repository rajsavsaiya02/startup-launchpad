# 🧪 Test Suite for Startup Launchpad

This directory contains organized test cases to verify different aspects of the application.

## 📂 Structure

- **`Database/`**: Tests related to database connectivity, CRUD operations, and schema validation.
  - `db_connection_test.js`: Verifies connection to the PostgreSQL database.
  - `db_crud_test.js`: Performs full Create, Read, Update, Delete lifecycle tests.
- **`Backend/`**: API endpoint tests, authentication logic, and controller unit tests.
- **`Client/`**: Frontend component tests, UI flow validation (e.g., using Jest/Vitest or Cypress).
- **`Integration/`**: End-to-end tests ensuring Backend, Database, and Client work together.
- **`AI/`**: Tests for specific AI features (e.g., Prompt generation, Data processing).
- **`Temp/`**: Temporary test scripts for quick debugging or experiments.

## 🚀 How to Run Tests

### Database Tests
**Prerequisites:** Ensure `server/.env` is configured with valid DB credentials.

**Preferred Method (via Server Scripts):**
```bash
cd server
npm run test:db-connection
npm run test:db-crud
```

**Alternative (Direct Node execution):**
*These scripts have been configured to use the server's modules.*
```bash
node Tests/Database/db_connection_test.js
node Tests/Database/db_crud_test.js
```

### Backend Tests
**Prerequisites:** Ensure `server/.env` is configured with `EMAIL_USER`, `EMAIL_PASS`, and SMTP details.

**Preferred Method:**
```bash
cd server
npm run test:email
```

**Alternative:**
```bash
node Tests/Backend/email_test.js
```

### Client Tests
*(Coming Soon)*

## 🛠️ Adding New Tests
1.  Identify the scope of your test.
2.  Place the script in the appropriate folder.
3.  Ensure it uses the shared environment configuration if needed.
