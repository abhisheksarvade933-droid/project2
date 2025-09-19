# Organ Transplantation Website

## Overview

This is a comprehensive organ transplantation website built with modern web technologies. The website facilitates the entire organ transplantation process by connecting patients who need organ transplants with potential donors, while providing medical professionals and administrators with the tools needed to manage the website efficiently.

The website supports four distinct user roles: patients (who can request organs), donors (who can pledge organs), doctors (who manage requests and matches), and administrators (who oversee the entire website). Each role has a specialized dashboard tailored to their specific needs and responsibilities in the organ transplantation workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging modern React patterns including hooks, context providers, and functional components. The UI is constructed using Radix UI primitives with shadcn/ui components for consistent design and accessibility. Styling is handled through Tailwind CSS with CSS custom properties for theming support.

Key architectural decisions include:
- **Component Structure**: Organized into feature-based folders with reusable UI components
- **Routing**: Uses wouter for lightweight client-side routing with role-based protected routes
- **State Management**: Combines React Context for authentication state with TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Styling Strategy**: Utility-first CSS with Tailwind, custom CSS properties for theming

### Backend Architecture
The server follows an Express.js architecture with TypeScript, implementing a RESTful API design. The application uses a layered architecture pattern separating concerns between routes, business logic, and data access.

Key architectural components include:
- **API Layer**: Express routes organized by feature domain (auth, organ requests, pledges, matches)
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Authorization**: Role-based access control with middleware for route protection
- **Data Layer**: Abstracted through a storage interface pattern for database operations
- **Error Handling**: Centralized error handling with structured error responses

### Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed around the core entities in the organ donation process with proper relationships and constraints.

Core entities include:
- **Users**: Supports multiple roles (patient, donor, doctor, admin) with role-specific fields
- **Organ Requests**: Patient requests for specific organs with priority levels and approval workflow
- **Organ Pledges**: Donor commitments to donate organs with availability tracking
- **Organ Matches**: Potential matches between requests and pledges managed by medical staff
- **Medical Records**: Supporting medical documentation for the donation process

The database uses enums for standardized values (blood types, organ types, statuses) and includes proper indexing for performance optimization.

### Authentication & Authorization
The system implements a comprehensive authentication and authorization strategy using JWT tokens with role-based access control.

Features include:
- **Registration/Login**: Secure user registration with password hashing and email validation
- **Role Management**: Four distinct user roles with different permission levels
- **Protected Routes**: Frontend and backend route protection based on user roles
- **Session Management**: Token-based authentication with secure storage
- **Password Security**: Bcrypt hashing with salt rounds for password protection

### State Management Strategy
The website uses a hybrid approach to state management, combining different tools for different types of state:

- **Authentication State**: React Context for user authentication status and profile information
- **Server State**: TanStack Query for caching, synchronizing, and updating server data
- **Form State**: React Hook Form for local form state management
- **UI State**: Local component state and URL state for transient UI interactions

This approach provides optimal performance while maintaining code simplicity and avoiding over-engineering.

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database with Neon serverless hosting support
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Connection Pooling**: Neon serverless connection pooling for scalability

### Authentication Services
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **Session Storage**: Secure token storage in localStorage (client) and memory (server)

### UI & Styling Framework
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Development & Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Query & Form Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for forms and API data
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Routing & Navigation
- **wouter**: Lightweight React router for client-side navigation
- **Protected Routes**: Custom route guards based on authentication and authorization

The system is designed to be scalable, maintainable, and secure, with clear separation of concerns and modern development practices throughout the codebase.