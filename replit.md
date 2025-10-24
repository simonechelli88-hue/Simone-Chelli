# RAPPORTINI EURO EL

## Overview

RAPPORTINI EURO EL is a timesheet management application for EURO EL employees. The system enables workers to track daily work hours, assign work to specific phases/projects, and manage time off (sick leave and vacation). Administrators can oversee employees, manage work phase definitions, and monitor workforce statistics.

The application is built as a full-stack web application with a React frontend, Express backend, and PostgreSQL database. It uses Replit's authentication system for user management with role-based access control (employee vs. admin).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Shadcn/ui components based on Radix UI primitives
- Consistent component library following Material Design principles adapted for enterprise use
- Tailwind CSS for styling with custom design tokens
- Design emphasizes clarity, efficiency, and data integrity for daily business operations

**State Management**: 
- TanStack Query (React Query) for server state management
- Query keys follow RESTful patterns (e.g., `/api/timesheets/:userId/:yearMonth`)
- No global client-side state management beyond React Query cache

**Routing**: Wouter for client-side routing
- Route protection based on authentication status and user role (admin vs. employee)
- Conditional routing: admins see dashboard/employees/phases pages, employees see only their timesheet calendar

**Key Design Patterns**:
- Custom hooks for reusable logic (`useAuth`, `useInactivityTimeout`)
- Form validation using React Hook Form with Zod resolvers
- Calendar-based timesheet interface for intuitive date selection and data entry

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Design**: RESTful JSON API
- Authentication routes: `/api/auth/*` for user session management
- Timesheet CRUD: `/api/timesheets/*` for employee time tracking
- Work phases: `/api/phases/*` for managing predefined work categories
- Admin endpoints: `/api/admin/*` for employee management and statistics

**Database ORM**: Drizzle ORM
- Type-safe database queries
- Schema defined in `shared/schema.ts` for sharing types between frontend and backend
- Migrations stored in `/migrations` directory

**Authentication & Session Management**:
- Replit OpenID Connect (OIDC) authentication via Passport.js strategy
- PostgreSQL-backed sessions using `connect-pg-simple`
- Session TTL: 1 hour with automatic logout on inactivity
- Role-based middleware: `isAuthenticated` and `isAdmin` guards

**Authorization Pattern**:
- Users can only access their own timesheets unless they have admin privileges
- Admin users have full access to all employee data and management functions

**Storage Layer**: 
- Abstracted storage interface (`IStorage`) implemented by `DatabaseStorage`
- Centralizes all database operations for easier testing and maintenance
- Operations grouped by domain: user, timesheet, work phase, admin stats

### Data Models

**Core Entities**:

1. **Users**: Authentication and profile information
   - Fields: id, email, firstName, lastName, profileImageUrl, isAdmin
   - Created/updated via Replit Auth OIDC flow

2. **Timesheets**: Daily work records
   - Fields: userId, date, type (LAVORATO/MALATTIA/FERIE), workPhaseId, hours
   - One timesheet per user per day
   - Hours tracked as decimal (e.g., 8.5 for 8 hours 30 minutes)

3. **Work Phases**: Predefined categories of work
   - Fields: code, description, category, hourThreshold
   - Organized hierarchically by category codes (BOR01, BOR02, etc.)
   - Seeded with ~30+ predefined phases specific to EURO EL operations

4. **Sessions**: Required for Replit Auth
   - Standard session storage with expiration tracking

**Database Relationships**:
- Users → Timesheets (one-to-many)
- WorkPhases → Timesheets (one-to-many)
- No cascading deletes to preserve historical data integrity

### Business Logic

**Timesheet Entry Rules**:
- One entry per employee per day
- Type selection determines data collection: work phases required for "LAVORATO", optional for sick/vacation
- Default to 8 hours for non-work types
- Hours are editable for all types

**Work Phase Management**:
- Phases organized by category for easier selection in dropdowns
- Admin-configurable hour thresholds for alerts/reporting
- Predefined phases seeded at database initialization

**Access Control**:
- Employees: Can only view/edit their own timesheets
- Admins: Full access to all timesheets, employee management, and work phase configuration

## External Dependencies

### Core Infrastructure

**Database**: Neon PostgreSQL (serverless)
- Connection via `@neondatabase/serverless` with WebSocket support
- Environment variable: `DATABASE_URL`
- Uses connection pooling for efficient resource usage

**Authentication Provider**: Replit Auth (OpenID Connect)
- Discovery endpoint: `process.env.ISSUER_URL` (defaults to `https://replit.com/oidc`)
- Client credentials: `process.env.REPL_ID`
- Session secret: `process.env.SESSION_SECRET`

### Third-Party Libraries

**UI Components**: 
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui configuration for styled component variants
- Lucide React for icons

**Utilities**:
- `date-fns` for date manipulation and formatting (Italian locale support)
- `zod` for runtime schema validation
- `nanoid` for unique ID generation

**Development Tools**:
- Replit Vite plugins for development experience (cartographer, error overlay, dev banner)
- TypeScript for type safety across the stack

### CSS Framework

**Tailwind CSS** with custom configuration:
- Custom color scheme using CSS variables for theme support
- Design tokens defined in `client/src/index.css`
- Rounded corners: lg (9px), md (6px), sm (3px)
- Spacing system based on Tailwind defaults (2, 4, 6, 8, 12, 16 units)

### Font Loading

**Google Fonts**: Inter font family loaded from CDN
- Weights: 300, 400, 500, 600, 700, 800
- Preconnect for performance optimization