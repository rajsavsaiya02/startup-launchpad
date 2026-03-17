---
name: Doc-Technical-Writing
description: Instructions for generating SRS, project reports, and API documentation.
---

# Goal
To produce clear, concise, and comprehensive technical documentation that serves as a single source of truth for the Startup LaunchPad project.

# Step-by-Step Logic
1. **Audience Identification**: Determine if the document is for developers (API Docs), stakeholders (Reports), or end-users (Guides).
2. **Standardization**: Use consistent naming conventions and formatting across all documents.
3. **Structure**: 
   - **SRS**: Introduction, System Architecture, Functional Requirements, Non-functional Requirements.
   - **API Docs**: URL, Method, Request Body, Response Codes, Examples.
4. **Visual Aids**: Embed diagrams (Mermaid) and screenshots to clarify complex sections.
5. **Review Cycle**: Periodically audit documentation to ensure it matches the actual implementation.

# Technical Constraints
- **Format**: Markdown (primary) or PDF (for formal reports).
- **Tooling**: Swagger/OpenAPI for automated API documentation.

# Code Patterns
```markdown
# API Specification: POST /api/v1/auth/login

Authenticates a user and returns a session token.

### Request Body
| Field    | Type   | Description |
| -------- | ------ | ----------- |
| email    | string | User email  |
| password | string | Secret key  |

### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```
```

# Tool Integration
- **Google Search**: Find standard SRS templates or OpenAPI 3.0 specification guidelines.
- **Draw.io**: Export diagrams for inclusion in formal project reports.
- **Figma**: Capture UI snapshots for user guides and walkthroughs.
