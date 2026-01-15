# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 project using the App Router with TypeScript, Tailwind CSS, and Mistral AI integration. It's a monorepo with the main application code in the `/app` directory.

## Development Commands

All commands should be run from the `/app` directory:

- **Development server**: `pnpm dev` - Starts the Next.js development server on http://localhost:3000
- **Build**: `pnpm build` - Creates an optimized production build
- **Production start**: `pnpm start` - Starts the production server (requires build first)
- **Lint**: `pnpm lint` - Runs ESLint to check code quality

The project uses **pnpm** as the package manager (specified in package.json as `packageManager: pnpm@10.28.0`).

## Architecture

### Directory Structure

- `/app` - Main Next.js application
  - `app/` - Next.js App Router directory (pages and layouts)
  - `public/` - Static assets
  - Configuration files: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`

### Key Technologies

- **Next.js 16.1.1** with App Router and React 19
- **TypeScript 5** for type safety (strict mode enabled)
- **Tailwind CSS 4** for styling with PostCSS
- **Mistral AI SDK** (@mistralai/mistralai) for AI integration
- **ESLint** with Next.js and TypeScript support

### TypeScript Configuration

- Uses path alias `@/*` for importing from the root of the app directory
- Strict mode enabled for type checking
- React JSX transform configured
- Incremental compilation enabled for faster rebuilds

### Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss` plugin
- Global styles in `app/globals.css`
- Font optimization via Next.js (`next/font` with Geist fonts)

### Code Quality

ESLint configuration in `eslint.config.mjs` extends:
- `eslint-config-next/core-web-vitals` - Core Web Vitals rules
- `eslint-config-next/typescript` - TypeScript-specific rules

Ignored paths: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Common Development Patterns

- Use the App Router (`app/` directory) for pages and layouts
- Use TypeScript for all new code (strict mode enforced)
- Use Tailwind CSS classes for styling
- Use the `@` alias for imports from the root directory
- React Server Components are the default; use `'use client'` directive when client-side interactivity is needed
