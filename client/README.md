# Startup LaunchPad – Client

The frontend application for **Startup LaunchPad**, built with **React 19**, **Vite**, and **Mantine UI**.

📖 **[Read the Full Frontend Technical Guide](../docs/FRONTEND_TECHNICAL_GUIDE.md)** for architecture usage rules.

---

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

3. **Start Storybook (UI Dev)**
   ```bash
   npm run storybook
   ```
   Browse and develop components in isolation at `http://localhost:6006`.

---

## 🛠️ Key Technologies

- **UI Framework**: [Mantine v7](https://mantine.dev/) + Tailwind CSS
- **State Management**: TanStack Query (Server) + Redux Toolkit (Client)
- **Routing**: React Router v7
- **Visualization**: ECharts
- **Testing**: Vitest + Playwright + React Testing Library

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the local Vite development server. |
| `npm run build` | Build the application for production (to `dist/`). |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint check. |
| `npm run storybook` | Launch Storybook UI explorer. |
| `npm run test` | Run unit/component tests via Vitest. |
| `npm test` | Alias for `npm run test`. |

## 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for E2E.
- **Unit Tests**: `npm run test`
- **Storybook Tests**: `npm run test-storybook` (if configured)

For detailed engineering guidelines, specific library rules, and best practices, strictly refer to the **[Frontend Technical Guide](../docs/FRONTEND_TECHNICAL_GUIDE.md)**.
