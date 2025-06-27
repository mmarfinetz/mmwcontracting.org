# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hybrid web application for Marfinetz Plumbing (MMW Contracting) featuring a Windows 95/97 retro theme. The project combines static HTML/CSS/JavaScript pages with a modern Next.js React application for the revenue calculator.

## Key Commands

### Development
```bash
npm run dev              # Start Next.js dev server on port 3000
npm run lint             # Run ESLint
npm run clean            # Clean build artifacts
```

### Building
```bash
npm run build            # Standard Next.js build
npm run build-for-vercel # Production build preserving Windows 95 theme
./build-for-vercel.sh    # Shell script that handles the hybrid build
```

## Architecture

### Hybrid Structure
- **Static Site**: Windows 95 themed interface (`index.html`, `/css/win97.css`, `/js/main.js`)
- **Next.js App**: Modern React components for calculator and future features (`/app`, `/components`)
- The calculator is embedded in the Windows 95 interface via iframe

### Key Technologies
- Next.js 14.1.0 with App Router
- TypeScript with strict mode
- Tailwind CSS for Next.js components
- Recharts for data visualization
- Custom Windows 95/97 CSS theme

### Important Files
- `/css/win97.css` - Core Windows 95 theme styles
- `/js/main.js` - Window management, drag functionality, taskbar behavior
- `/components/RevenueCalculator.tsx` - Main calculator component
- `/build-for-vercel.sh` - Critical build script that preserves static files while building Next.js

### Build Process
The build process is unique because it:
1. Preserves the original `index.html` with Windows 95 theme
2. Builds Next.js app to `/out` directory
3. Copies calculator output to `/public/calculator`
4. Ensures static assets (img, css, js) are in `/public`

### Development Notes
- The site uses a desktop-first approach but includes mobile styles
- Window components are draggable and resizable
- Multiple quote calculators exist: power washing (`/js/powerwashing-quote.js`) and projects (`/js/project-quote.js`)
- TypeScript path alias `@/*` is configured for imports
- Images are unoptimized in production for static export compatibility

## GitHub Actions CI/CD

The project uses GitHub Actions for continuous integration and deployment:

### Workflows
1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Triggers: Push to main/develop/feature branches and pull requests
   - Actions: ESLint, TypeScript type checking, build verification
   - Includes dependency caching for faster runs

2. **Build PR Workflow** (`.github/workflows/build-pr.yml`)
   - Triggers: Pull request events (opened, synchronized, reopened)
   - Actions: Builds the project using `npm run build-for-vercel`
   - Uploads build artifacts and comments on PR with status
   - Includes Next.js build caching

3. **Deploy Production** (`.github/workflows/deploy-production.yml`)
   - Triggers: Push to main branch or manual workflow dispatch
   - Actions: Builds and deploys to GitHub Pages
   - Creates `_site` directory with all static assets and built files
   - Includes build artifact caching

4. **Dependabot** (`.github/dependabot.yml`)
   - Weekly dependency updates for npm packages
   - Maximum 5 open pull requests at a time

### Caching Strategy
- Node modules are cached using npm's built-in caching
- Next.js build cache is stored in `.next/cache` and `out/` directories
- Cache keys include file hashes for smart invalidation

## Working Guidelines for Claude Code

### Problem Solving Approach
- Use `<ultrathink>` when engaging in complex problems that require deep analysis or multi-step reasoning
- This helps ensure thorough consideration of all aspects before implementation

### Efficiency Optimization
- For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially
- Example: When searching for multiple file patterns or running multiple bash commands, batch them in a single message with multiple tool calls
- This parallel execution approach significantly reduces task completion time