# Development Rules

## 1. Inspection First
- **Always** inspect existing code before modifying it. Use tools to view the file or directory.
- Understand the existing architecture and patterns before introducing new ones.

## 2. Reusability & Components
- Prefer reusing existing components over creating new ones.
- Keep components focused, small, and modular.
- Avoid duplicating functionality.
- Business logic should generally be kept out of presentational components.

## 3. Scope & Side Effects
- Do not randomly change unrelated files. Only modify files necessary for the current task.
- Preserve existing behavior unless explicitly asked to change it.

## 4. Dependencies
- Do not introduce dependencies without justification.
- Stick to the provided tech stack unless a new tool adds clear, irreplaceable value.

## 5. Responsive Design & Accessibility
- Keep responsive behavior in mind. Use a mobile-first approach where practical.
- Use the predefined CSS variables (`globals.css`) for consistent spacing, colors, breakpoints, etc.
- Build with accessibility (a11y) in mind (semantic HTML, proper contrast, aria attributes where necessary).

## 6. Code Quality
- Follow the established architecture and naming conventions.
- Keep the code clean, readable, and production-ready.
- Validate changes after implementation. Ensure the project builds and runs successfully.
