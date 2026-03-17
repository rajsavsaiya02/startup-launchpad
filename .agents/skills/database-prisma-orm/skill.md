---
name: Database-Prisma-ORM
description: Focus on schema migrations and type-safe queries.
---

# Goal
To bridge the application logic and PostgreSQL database using Prisma ORM, ensuring type safety, easy migrations, and efficient data fetching.

# Step-by-Step Logic
1. **Schema Modeling**: Define the source of truth in `schema.prisma` using modern attributes.
2. **Migrations**: Manage database versioning using `prisma migrate dev` for development and `prisma migrate deploy` for production.
3. **Type-Safe Queries**: Utilize the generated Prisma Client to perform CRUD operations with full TypeScript support.
4. **Performance**: Use `select` and `include` carefully to avoid the N+1 problem. Leverage Prisma's raw query support when specialized SQL optimization is needed.
5. **Validation**: Integrate Prisma errors with the application's global error handler.

# Technical Constraints
- **Prisma Version**: 5.x+.
- **Database**: PostgreSQL 18.
- **Type Generation**: Always run `prisma generate` after schema changes.

# Code Patterns
```typescript
// Optimized Type-Safe Query
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStartupDetails = async (startupId: string) => {
  return await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      founder: true,
      metrics: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
};
```

# Tool Integration
- **Google Search**: Debug complex Prisma migration issues or find patterns for advanced middleware.
- **Draw.io**: Use to map out the Prisma schema relationships before writing the `.prisma` file.
