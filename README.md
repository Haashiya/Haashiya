# Website Foundation

This is the foundation for a production-quality website built with Next.js and React.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Vanilla CSS with custom CSS variables (No Tailwind)
- Linting: ESLint

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure
- `src/app`: Next.js App Router structure (pages, layouts)
- `src/components`: Reusable UI components
- `src/features`: Feature-specific modules
- `src/lib`: Utilities, API clients, and helper functions
- `src/types`: Global TypeScript types
- `src/config`: Application configuration
- `src/assets`: Static assets, global styles

## Important Development Conventions
Please review `DEVELOPMENT_RULES.md` before contributing.
