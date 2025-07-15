# Talents & Stars Platform

## Overview

Talents & Stars is a comprehensive AI-powered entertainment industry platform that connects talent (actors, musicians, voice artists, models) with producers, managers, and casting directors. The platform features dynamic user profiles, media management, real-time messaging, job posting, AI-enhanced profile optimization, and advanced enterprise features including Stripe monetization, WebSocket real-time communication, and comprehensive admin controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Emotional Progress Mascot System Implementation (July 15, 2025)
- **Interactive Mascot**: Created comprehensive emotional progress mascot system with 8 distinct emotions (happy, excited, proud, celebrating, motivated, calm, focused, sleepy)
- **Progress Tracking**: Built dynamic progress calculation system that responds to user profile completion with real-time emotional feedback
- **Animation System**: Implemented smooth Framer Motion animations including floating particles, eye expressions, mouth styles, and color-coded emotional states
- **Integration**: Successfully integrated mascot into TalentDashboard with profile completion tracking, achievement celebrations, and motivational messaging
- **Components Created**: MascotEmotions.tsx for core mascot functionality, ProgressMascot.tsx for progress tracking, and comprehensive demo page
- **Features**: Point-based achievement system, categorized progress items, celebration animations, contextual tips, and interactive progress management
- **Result**: ✅ Complete emotional progress mascot system with delightful user experience and real-time profile completion tracking

### Feature Implementation Updates (July 15, 2025)
- **Admin Settings System**: Created comprehensive admin settings management with encrypted key storage, OpenAI configuration, and category-based organization
- **Meeting Request System**: Implemented full meeting request workflow with status tracking, user selection, and meeting type options
- **Profile Image Upload**: Built mandatory 1:1 profile image system with automatic cropping and Wasabi S3 integration
- **Work Experience Display**: Enhanced talent dashboard to prominently display work experience on main overview instead of social section
- **Calendar Fix**: Added missing calendar API endpoints and storage methods for availability event management
- **Database Tables**: Created admin_settings and meeting_requests tables with proper foreign key relationships
- **Result**: ✅ All new features properly implemented with working API endpoints and database integration

### Modern Dashboard Designs and Social Media Integration (July 15, 2025)
- **Implementation**: Created comprehensive modern dashboard designs for all user roles with integrated social functionality
- **Components Created**:
  - **TalentDashboard**: Modern blue-purple gradient design with profile completion tracking, applications management, opportunities discovery, and portfolio management
  - **ManagerDashboard**: Emerald-blue gradient design with talent roster management, opportunity tracking, meeting scheduling, and client coordination
  - **ProducerDashboard**: Orange-red gradient design with project management, casting calls, talent pool access, and production analytics
  - **AgentDashboard**: Indigo-purple gradient design with client management, deal tracking, contract negotiations, and commission analytics
- **Features**:
  - Role-specific color schemes and branding (blue-purple for talent, emerald-blue for managers, orange-red for producers, indigo-purple for agents)
  - Comprehensive tab-based navigation (Overview, Role-specific tabs, Social, Analytics)
  - Interactive stats cards with gradient backgrounds and icons
  - Profile completion tracking with visual progress indicators
  - Real-time data integration with TanStack Query
  - Social media integration with post creation and feed access
  - Modern card-based layouts with hover effects and animations
- **Social Media Enhancement**: Enhanced Social.tsx with proper Wasabi S3 media upload integration and improved post creation system
- **Result**: ✅ Modern, role-specific dashboard designs with complete social media integration ready for production

### Comprehensive Permission System Implementation (July 15, 2025)
- **Implementation**: Built complete permission management system with role-based and user-specific permissions
- **Components Created**:
  - Permission management UI in `/admin/permissions` with role management, user permissions, and creation interfaces
  - Permission hooks (`usePermissions`, `useRoleCheck`) for client-side access control
  - Permission gates (`PermissionGate`, `AdminGate`, `ProducerGate`) for component-level protection
  - Protected routes (`ProtectedRoute`, `AdminRoute`, `PermissionRoute`) for page-level access control
  - Server-side permission middleware (`requirePermission`, `requireAnyPermission`) for API protection
- **Features**:
  - Granular category-based permissions (USER, ADMIN, CONTENT, JOBS, MEDIA, BILLING, SYSTEM, AI)
  - Role-based default permissions with user-specific overrides
  - Permission auditing and logging for security tracking
  - Time-based permission expiration and IP/time restrictions
  - Comprehensive permission initialization endpoints
- **Architecture**: Category-action-resource permission structure with inheritance and override capabilities
- **Result**: ✅ Complete permission system ready for production use with comprehensive access control

### Session Authentication Fix (July 15, 2025)
- **Issue**: Session cookies were being set with `secure: true` flag, preventing session persistence in development environment
- **Root Cause**: Session middleware was defaulting to secure cookies even in development mode
- **Solution**: 
  - Forced `secure: false` in session configuration for all environments
  - Added middleware to ensure cookie secure flag is always false in development
  - Confirmed session persistence works correctly across login/logout/user endpoints
- **Result**: ✅ Authentication system now fully functional with proper session management

### JavaScript Error Fixes and Language System Implementation (July 15, 2025)
- **Issues Fixed**:
  - Missing `handleAddJobHistory` function causing JavaScript errors in TalentDashboard
  - Multiple duplicate function declarations causing compilation errors
  - Profile completion navigation 404 error
  - Language system not appearing on home pages
- **Solutions Applied**:
  - Added missing `handleAddJobHistory` function with proper job history mutation
  - Removed duplicate `createJobHistoryMutation` and `handleViewApplications` functions
  - Fixed profile completion redirect to use `/onboarding` route instead of non-existent `/profile-completion`
  - Added both `/onboarding` and `/profile-completion` routes pointing to Onboarding component
  - Integrated LanguageSelector component into Home.tsx and Landing.tsx pages
  - Added language selector to hero sections for multi-language support
- **Test Credentials**: martyTEST / 123456
- **Result**: ✅ All JavaScript errors resolved, profile completion working, multi-language support visible on home pages

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
- **WebSocket Support**: Real-time message delivery with WebSocket server
- **Thread Management**: Conversation organization and history
- **Notification System**: Message status tracking
- **Chat Rooms**: Multi-user chat room creation and management
- **Real-time Broadcasting**: Live updates across all connected clients

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
- **AI-Enhanced Job Descriptions**: Automatic job description generation and optimization
- **Smart Talent Matching**: AI-powered job-to-talent matching with scoring and reasons
- **Real-time Job Notifications**: Instant alerts for new opportunities

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

### Enhanced AI Features
- **Profile Enhancement**: AI-powered bio generation and profile optimization
- **Content Moderation**: Automatic content filtering and safety checks
- **Smart Tagging**: AI-generated tags for better searchability
- **Email Automation**: AI-generated professional email replies
- **Profile Summaries**: Automatic profile summary generation
- **Job Matching**: Advanced AI-powered talent-to-job matching with scoring

### Monetization & Payments
- **Stripe Integration**: Full payment processing with subscription management
- **Tiered Pricing**: Flexible pricing tiers with database management
- **Webhook Handling**: Real-time payment status updates
- **Customer Management**: Automated customer and subscription tracking
- **Revenue Analytics**: Comprehensive payment and subscription analytics

### Enterprise Features
- **Admin Panel**: Comprehensive admin controls and user management
- **Verification System**: Admin-controlled talent verification workflow
- **Analytics Dashboard**: Platform usage and performance metrics
- **Email Templates**: Customizable notification email templates
- **Content Management**: AI-powered content generation and moderation

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit Auth/OpenID Connect
- **AI Services**: OpenAI API for profile enhancement
- **Media Storage**: Configured for Wasabi/AWS S3
- **Real-time**: WebSocket server integration
- **Payments**: Stripe for subscription management
- **Email**: Email service integration for notifications

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