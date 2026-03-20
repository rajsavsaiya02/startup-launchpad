---
name: Testing-Unit-Vitest
description: Specialized logic for component and logic testing with Vitest.
---

# Goal
To ensure individual units of code (functions, components, hooks) work correctly in isolation, providing high confidence and preventing regressions.

# Step-by-Step Logic
1. **Test Suite Setup**: Organize tests matching the source file structure (e.g., `ComponentName.test.tsx`).
2. **Mocking**: Use `vi.mock()` and `vi.fn()` for external dependencies (APIs, third-party libraries).
3. **Component Testing**: Use React Testing Library to test component behavior rather than implementation details.
4. **Coverage Goals**: Aim for 80%+ coverage on business logic and critical UI paths.
5. **Snapshot Testing**: Use sparingly for complex UI structures that are stable.

# Technical Constraints
- **Test Runner**: Vitest (fast, Vite-compatible).
- **Environment**: jsdom for component tests.
- **Assertions**: Vitest's `expect` API.

# Code Patterns
```typescript
// Vitest + React Testing Library Pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should call onSubmit with credentials when submitted', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

# Tool Integration
- **Google Search**: Research Vitest mocking strategies for specific libraries (e.g., Mantine).
- **Figma**: Reference Figma prototypes to determine expected interaction behaviors for testing.
