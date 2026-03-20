---
name: Backend-Express-Core
description: Architecture and development of scalable Node.js/Express APIs for Startup LaunchPad.
---

# Goal
To design and implement a robust, secure, and high-performance RESTful API using Node.js and Express, centered around clean architecture principles.

# Step-by-Step Logic
1. **Project Structure**: Follow a layered architecture (Controllers -> Services -> Repositories).
2. **Middleware Orchestration**: Implement standard middlewares for logging (Morgan/Winston), security (Helmet), and CORS.
3. **Authentication/Authorization**: Secure endpoints using JWT and role-based access control (RBAC).
4. **Error Handling**: Use a centralized error handling middleware to catch and format all exceptions.
5. **Validation**: Validate all incoming requests using Zod or Joi to ensure data integrity.

# Technical Constraints
- **Node.js**: 20+ (ESM only).
- **Express**: 4.x or 5.x beta.
- **Database**: PostgreSQL 18 via Prisma ORM.
- **Response Format**: Always return standardized JSON (e.g., `{ success: true, data: ... }`).

# Code Patterns
```typescript
// Layered Service Pattern
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const user = await UserService.register(validatedData);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error); // Pass to central error handler
  }
};
```

# Tool Integration
- **Draw.io**: Generate and maintain Data Flow Diagrams (DFDs) for complex backend logic.
- **Google Search**: Research latest security vulnerabilities (OWASP Top 10) and Node.js performance tuning.
