# Frontend Technical Guide

## 📚 Overview
This document outlines the technical architecture, library selection, and best practices for the **Startup LaunchPad** frontend application (located in `/client`).

All libraries listed below are selected for stability, scalability, and long-term maintenance.

---

## 1. Core Architecture
| Library | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **React** | UI Rendering | Keep components small and composable. Avoid business logic in JSX. |
| **Vite** | Build Tool | Use `npm run dev` for local development. Production builds use `rollup` under the hood. |
| **react-router-dom** | Routing | Use for all client-side navigation. Keep route loaders light. |

---

## 2. UI & Styling Framework
**Primary System:** [Mantine UI](https://mantine.dev/) + [Tailwind CSS](https://tailwindcss.com/)

### Library Selection
| Library | Category | When to Use | Rules |
| :--- | :--- | :--- | :--- |
| **Mantine UI** | Component Lib | Forms, Modals, Buttons, Inputs, Layouts. | Prefer Mantine components over building from scratch. Centralize theme config in `theme.js`. |
| **Tailwind CSS** | Utility CSS | Spacing, Layout, Typography overrides. | Avoid deep nesting. Use standard tokens. |
| **Radix UI** | Headless UI | Complex accessible interactive primitives. | Use only if Mantine doesn't have an equivalent primitive. |
| **Lucide React** | Icons | All application icons. | Do not import icons from other sets. |
| **Shadcn/UI** | Components | Pre-built tailored components. | Treat as copy-paste code, not an external dependency. |

---

## 3. Data Management & State
We strictly separate **Server State** (API data) from **Client State** (UI preferences).

| Library | Type | Purpose | Rules |
| :--- | :--- | :--- | :--- |
| **TanStack Query** | Server State | Caching, fetching, updating API data. | **Never** store API responses in Redux. Use `staleTime` and invalidation strategies. |
| **Redux Toolkit** | Client State | Global UI state (Auth, Permissions, Toggles). | Keep strict domain-based slices. No API data here. |
| **Zustand** (Optional) | Client State | Simple atomic state. | Use for isolated features if Redux is too heavy. |

---

## 4. Interaction & Animation
| Library | Purpose | Guidelines |
| :--- | :--- | :--- |
| **Framer Motion** | Animation | Page transitions, complex micro-interactions. Avoid animating large lists. |
| **@dnd-kit** | Drag & Drop | Kanban boards, reorderable lists. Virtualize if lists are long. |
| **Floating UI** | Positioning | Tooltips, Popovers (if custom). | Prefer Mantine's built-in Popover/Tooltip first. |

---

## 5. High-Performance Data Rendering
| Library | Use Case | Rules |
| :--- | :--- | :--- |
| **TanStack Table** | Datagrids | Use for admin tables, sorting, filtering. Always implement server-side pagination for large datasets. |
| **React Window** | Virtualization | Mandatory for lists with >200 items (e.g., Activity Feeds). |
| **Apache ECharts** | Charts | Financial dashboards. Complex visualizations. Offload heavy data processing. |

---

## 6. Realtime Communication
| Library | Implementation | Rules |
| :--- | :--- | :--- |
| **Socket.io-client** | WebSockets | Live updates, Chat, Notifications. | Emit events, do not send full state snapshots if possible. |
| **RxJS** | Reactive Streams | Complex event pipelines (rarely needed). | Use sparingly. Isolate logic. |

---

## 7. Utilities & Helpers
- **Axios**: HTTP Client. Use central interceptors for Auth tokens.
- **date-fns**: Date formatting and manipulation. Lightweight and tree-shakeable.
- **clsx / tailwind-merge**: Merging class names dynamically.

---

## 8. Stability, Testing & Monitoring
| Capability | Library |
| :--- | :--- |
| **Unit Testing** | **Vitest** (Fast, Vite-native) |
| **Component Testing** | **React Testing Library** |
| **E2E Testing** | **Playwright** (Critical user flows) |
| **Mocking** | **MSW** (Mock Service Worker) for API simulation. |
| **Visual Testing** | **Storybook** for component development. |
| **Error Handling** | **react-error-boundary** to prevent white screens. |
| **Monitoring** | **OpenTelemetry** for production tracing. |

---

## 9. Performance Optimization (Web Vitals)
- **Workbox**: Service workers for offline caching (PWA capabilities).
- **IDB**: IndexedDB wrapper for local persistence of drafts/offline data.
- **Code Splitting**: Routes are lazy-loaded. Heavy libraries (ECharts) are split into manual chunks.

---

## 10. Development Workflow
1. **Start Dev Server**: `npm run dev`
2. **Run Storybook**: `npm run storybook` (for UI development)
3. **Run Tests**: `npm run test`
4. **Build**: `npm run build` (outputs to `dist/`)

---

> **Note**: Do not add new libraries unless a real problem cannot be solved with this stack. Bloat is the enemy of performance.
