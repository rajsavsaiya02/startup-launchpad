---
name: Frontend-React-Vite
description: Expert React 19 and Vite development patterns for Startup LaunchPad.
---

# Goal
To build high-performance, maintainable, and type-safe frontend applications using React 19 and Vite, ensuring optimal developer experience and user performance.

# Step-by-Step Logic
1. **Bootstrap with Vite**: Use the latest Vite templates for React + TypeScript.
2. **React 19 Hooks**: Leverage new React 19 features like `useActionState`, `useFormStatus`, and `useOptimistic` for form handling and UI updates.
3. **Strict Type Safety**: Implement rigorous TypeScript interfaces for all components and data structures.
4. **Performance Optimization**: 
   - Use `React.memo` for expensive components.
   - Implement code splitting using `React.lazy` and `Suspense`.
   - Optimize Vite build settings for production.
5. **State Management**: Utilize TanStack Query for server state and Mantine/Zustand for global client state.

# Technical Constraints
- **React Version**: 19.x (Strict adherence to new APIs).
- **Vite Version**: 6.x+ (Latest ESM-first approach).
- **TypeScript**: Strict mode must be enabled.
- **Node.js**: 20+ for local development and CI.

# Code Patterns
```tsx
// Modern React 19 Form Handling
import { useActionState } from 'react';
import { updateProfile } from './actions';

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="username" disabled={isPending} />
      {state?.error && <p>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

# Tool Integration
- **Google Search**: Use for researching the latest React 19 experimental features and Vite plugin compatibility.
- **Figma**: Reference Figma tokens directly when building components to ensure design fidelity.
