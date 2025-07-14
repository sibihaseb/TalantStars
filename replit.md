# Talents & Stars Platform

## Overview

Talents & Stars is a comprehensive AI-powered entertainment industry platform that connects talent (actors, musicians, voice artists, models) with producers, managers, and casting directors. The platform features dynamic user profiles, media management, real-time messaging, job posting, and AI-enhanced profile optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared schema in `/shared/schema.ts`
- **Migration Management**: Drizzle-kit for database migrations
- **Connection**: Neon PostgreSQL serverless database
- **Session Storage**: PostgreSQL-based session storage for authentication

## Key Components

### Authentication System
- **Provider**: Traditional username/password authentication with bcrypt
- **Session Management**: Express sessions with PostgreSQL storage
- **User Management**: Admin account creation and login system
- **Route Protection**: Passport.js middleware-based authentication checks
- **Password Security**: bcrypt hashing with salt for secure password storage
- **Admin Endpoints**: Fully functional admin user management API with JSON response handling
- **Vite Compatibility**: Resolved Vite dev server middleware conflicts for API routes

### User Profile Management
- **Multi-Role Support**: Talent, Manager, Producer roles
- **Dynamic Profiles**: Role-specific fields and capabilities
- **Profile Types**: Actor, Musician, Voice Artist, Model
- **Verification System**: Admin-controlled talent verification badges

### Interactive Onboarding System
- **Progress Tracker**: Visual progress indicator with step-by-step completion
- **Celebratory Animations**: Smooth transitions and celebration effects on step completion
- **Step Information**: Dynamic step titles, descriptions, and icons
- **Visual Feedback**: Animated progress bars, step indicators, and success celebrations
- **Responsive Design**: Mobile-friendly progress tracking interface
- **Role-Specific Questions**: Dynamic form fields based on user role (talent, manager, agent, producer)
- **Talent-Specific Questions**: Additional questions based on talent type (actor, musician, voice artist, model)
- **Database-Driven Questions**: All questions stored in database and managed through admin panel
- **65+ Comprehensive Questions**: Covering all roles and talent types with proper validation
- **Intelligent Form Validation**: Real-time validation with contextual suggestions and feedback
- **Smart Validation System**: Field-specific validation rules with helpful error messages and success indicators

### Role-Based Dashboard System
- **Talent Dashboard**: Profile completion tracking, application management, job discovery, and availability calendar
- **Producer Dashboard**: Project management, talent search, application tracking, and casting analytics
- **Manager Dashboard**: Talent roster management, opportunity tracking, meeting scheduling, and client coordination
- **Agent Dashboard**: Talent representation, casting connections, and deal negotiation tools
- **Admin Dashboard**: Platform administration, user management, and system analytics
- **Smart Routing**: Automatic dashboard selection based on user role with fallback to talent dashboard
- **Unified Navigation**: Consistent header and footer across all dashboard types

### Media Management
- **File Upload**: Support for images, videos, audio files
- **Storage**: Configured for external storage (Wasabi/AWS S3)
- **Media Types**: Portfolio images, demo reels, audio samples
- **External Links**: YouTube/Vimeo integration support

### Real-Time Communication
- **Messaging**: Built-in 1:1 and group messaging
- **WebSocket Support**: Real-time message delivery
- **Thread Management**: Conversation organization and history
- **Notification System**: Message status tracking

### Skill Endorsement System
- **One-Click Endorsements**: Quick skill validation from network connections
- **Grouped Display**: Endorsements organized by skill with counts and testimonials
- **Duplicate Prevention**: System prevents multiple endorsements of same skill by same user
- **Optional Messages**: Endorsers can add personal testimonials about skills
- **Real-Time Updates**: Immediate reflection of endorsement changes across platform
- **Social Validation**: Public display of peer-verified skills for enhanced credibility

### Search and Discovery
- **Advanced Filtering**: By talent type, location, availability, skills
- **AI-Powered Matching**: OpenAI integration for profile enhancement
- **Search Interface**: Dynamic filters with real-time results
- **Talent Cards**: Rich profile previews with media

### Job Management
- **Job Posting**: Producers can create casting calls and gigs
- **Application System**: Talent can apply to opportunities
- **Status Tracking**: Job progress and application management
- **Project Organization**: Folder-based talent organization

## Data Flow

### User Registration/Login
1. User authenticates via Replit Auth
2. User data is upserted to database
3. Profile creation/update flow initiated
4. Session established with PostgreSQL storage

### Profile Creation
1. Role-based onboarding flow
2. Dynamic form fields based on talent type
3. Media upload and external link integration
4. AI-enhanced profile optimization (optional)

### Search and Discovery
1. Filters applied to talent database query
2. Results rendered with pagination support
3. Talent cards display key information
4. Real-time updates for availability status

### Messaging System
1. WebSocket connection established
2. Message persistence in PostgreSQL
3. Real-time delivery to connected clients
4. Thread organization and history management

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit Auth/OpenID Connect
- **AI Services**: OpenAI API for profile enhancement
- **Media Storage**: Configured for Wasabi/AWS S3
- **Real-time**: WebSocket server integration

### UI/UX Libraries
- **Component Library**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and animations
- **Icons**: Lucide React icons (including celebratory icons like Trophy, Medal, PartyPopper)
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state
- **Animations**: CSS transitions and Tailwind animation classes

### Development Tools
- **Build Tool**: Vite for frontend bundling
- **Database Tools**: Drizzle Kit for migrations
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint and Prettier configuration

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reloading
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: Replit Auth integration
- **API Proxy**: Vite proxy for API requests

### Production Build
- **Frontend**: Vite build output to `/dist/public`
- **Backend**: ESBuild compilation to `/dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Environment Variables**: Database URL, OpenAI API key, session secrets

### Database Management
- **Migrations**: Drizzle-kit push for schema updates
- **Connection Pooling**: Neon serverless connection pooling
- **Session Storage**: PostgreSQL-based session table
- **Schema Sharing**: Shared types between frontend and backend

### Security Considerations
- **Authentication**: Secure session management with PostgreSQL
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation throughout
- **CORS**: Configured for production deployment
- **Environment**: Secure handling of API keys and secrets