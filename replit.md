# Overview

This is a financial charting application built with React and TypeScript, designed to display OHLCV (Open, High, Low, Close, Volume) data with technical indicators. The application features an interactive chart powered by KLineCharts that displays candlestick data with customizable Bollinger Bands indicators. It uses a monorepo structure with separate client and server directories, implementing a full-stack architecture with Express.js backend and React frontend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Charting**: KLineCharts library for financial candlestick charts and technical indicators
- **Forms**: React Hook Form with Zod validation using Hookform resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **Database Layer**: Drizzle ORM configured for PostgreSQL with Neon serverless database
- **Session Management**: connect-pg-simple for PostgreSQL-backed session storage
- **Development**: Hot reloading with Vite integration and custom error overlay

## Data Storage
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach and Zod integration
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations in `/migrations` directory
- **Fallback Storage**: In-memory storage implementation for development/testing

## Project Structure
- **Monorepo Layout**: Client, server, and shared code separation
- **Client**: React application in `/client` directory
- **Server**: Express.js API in `/server` directory  
- **Shared**: Common types and schemas in `/shared` directory
- **Build Strategy**: Separate build processes for client (Vite) and server (esbuild)

## Development Features
- **Hot Reloading**: Vite development server with HMR
- **Error Handling**: Custom runtime error modal for development
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Path Aliases**: Configured aliases for cleaner imports (`@/`, `@shared/`)

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm** and **drizzle-zod**: Modern TypeScript ORM with Zod schema integration
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **express**: Fast, unopinionated web framework for Node.js

## UI and Styling
- **@radix-ui/***: Comprehensive collection of low-level UI primitives (20+ components)
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Utility for creating component variants
- **lucide-react**: Icon library with React components

## Charting and Data Visualization  
- **klinecharts**: Specialized library for financial candlestick charts and technical indicators
- **date-fns**: Modern JavaScript date utility library for timestamp manipulation

## Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Form Handling and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema validation library

## Session and Security
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **nanoid**: Secure URL-friendly unique string ID generator