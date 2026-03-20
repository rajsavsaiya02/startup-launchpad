---
name: Frontend-UI-Styling
description: Mastery of Mantine UI, Radix, and Tailwind CSS integration for a premium SaaS look.
---

# Goal
To create a stunning, accessible, and responsive user interface that feels premium and "alive," leveraging the best of Mantine, Radix, and Tailwind.

# Step-by-Step Logic
1. **Design System Setup**: Define a central theme using Mantine `MantineProvider`.
2. **Tailwind for Layout**: Use Tailwind CSS for rapid layouting and utility-first responsiveness.
3. **Mantine for Components**: Use Mantine's rich library of components (Inputs, Modals, Tables) for consistent UI.
4. **Radix for Accessibility**: Use Radix primitives for complex interactive components where Mantine's defaults need more customization.
5. **Dynamic Aesthetics**: 
   - Implement Glassmorphism where appropriate.
   - Use HSL-based curated color palettes.
   - Add subtle micro-animations using Framer Motion or CSS transitions.

# Technical Constraints
- **Mantine Version**: 7.x+.
- **Tailwind Version**: 3.4+.
- **Accessibility**: Must meet WCAG 2.1 AA standards.
- **Responsive Design**: Mobile-first approach is mandatory.

# Code Patterns
```tsx
// Integrated Mantine + Tailwind + Framer Motion
import { Button, Group } from '@mantine/core';
import { motion } from 'framer-motion';

export const PremiumButton = ({ children, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button
      onClick={onClick}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all duration-300"
      radius="xl"
      size="md"
    >
      {children}
    </Button>
  </motion.div>
);
```

# Tool Integration
- **Figma**: Strictly follow Figma variables and export assets directly. Use the Figma-to-Code plugin for complex SVG icons.
- **Google Search**: Find premium color palettes and CSS-in-JS optimization techniques.
