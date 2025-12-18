# Startup LaunchPad – Client (React + Vite)

This directory contains the frontend application for the **Startup LaunchPad** project.  
The application is built using **React** and powered by **Vite** for a fast development environment with Hot Module Replacement (HMR).

## Core Responsibilities

- Providing the full user interface (UI) and user experience (UX).
- Communicating with the backend server via API requests.
- Managing frontend state, routing, and all user interactions.

## Technology Overview

This project uses **React + Vite**, which offers a minimal, modern development setup with fast builds and HMR.

Two official Vite React plugins are available:

- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react)**  
  Uses **Babel** (or **oxc** when used with Rolldown) for Fast Refresh.

- **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)**  
  Uses **SWC** for Fast Refresh.

### React Compiler Note

The new React Compiler is **not yet compatible with SWC**.  
See the issue here: [https://github.com/vitejs/vite-plugin-react/issues/428](https://github.com/vitejs/vite-plugin-react/issues/428)

### ESLint Configuration

If you're building a production-ready application, consider using **TypeScript** with type-aware lint rules.  
See the TypeScript template for more info: [https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)

## Getting Started

1. Navigate to the `client` directory.
2. Install dependencies using `npm install`.
3. Start the development server using `npm run dev`.
4. Open the app in your browser: [http://localhost:5173](http://localhost:5173) (default Vite dev port).

The page will automatically reload when you make changes.
