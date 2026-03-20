---
name: Design-UIUX-Standards
description: Focus on Figma workflow and user-centric design principles.
---

# Goal
To ensure every interface in Startup LaunchPad is intuitive, accessible, and high-converting, adhering to professional UI/UX standards.

# Step-by-Step Logic
1. **Information Architecture**: Map out the user journey to minimize "clicks-to-value."
2. **Figma Component Library**: Build and maintain a shared library of variants (Buttons, Modals, Inputs) to ensure design consistency.
3. **Accessibility Audit**: Use tools like "Contrast" or "Stark" within Figma to verify color ratios.
4. **Prototyping**: Create high-fidelity clickable prototypes to test interactions before hand-off to development.
5. **Visual Hierarchy**: Use typography, color, and spacing to guide the user's eye to primary actions (e.g., "Invest Now," "Launch Startup").

# Technical Constraints
- **Design Tool**: Figma (Primary).
- **Typography**: Strictly use the project's chosen Google Fonts (e.g., Inter, Montserrat).
- **Color Palettes**: Must be derived from the core branding tokens.

# Code Patterns
```markdown
# UX Checklist for New Features:
- [ ] Is the primary action prominent?
- [ ] Does it meet WCAG contrast ratios?
- [ ] Are there loading states for all async actions?
- [ ] Is the layout responsive (Mobile/Tablet/Desktop)?
- [ ] Are error messages helpful and actionable?
```

# Tool Integration
- **Figma**: Use the "Styles" panel for global color and text styles. Organize layers logically for developer hand-off.
- **Google Search**: Research modern SaaS UI trends (e.g., dark mode aesthetics, glassmorphism) for inspiration.
