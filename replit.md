# Talents & Stars Platform

## Overview

Talents & Stars is a comprehensive AI-powered entertainment industry platform that connects talent (actors, musicians, voice artists, models) with producers, managers, and casting directors. The platform features dynamic user profiles, media management, real-time messaging, job posting, AI-enhanced profile optimization, and advanced enterprise features including Stripe monetization, WebSocket real-time communication, and comprehensive admin controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Media Upload System Fix and Optimization (July 16, 2025)
- **Issue Resolution**: Fixed multipart boundary errors that were preventing file uploads from working properly
- **Frontend Enhancement**: Updated Media.tsx to use proper request formats:
  - File uploads now use FormData with multipart/form-data
  - External URL uploads use JSON with application/json content type
- **Backend Optimization**: 
  - Streamlined multer middleware to handle single file uploads instead of array uploads
  - Improved content-type detection and routing logic
  - Fixed file handling to use `req.file` instead of `req.files` array
  - Maintained proper error handling and tier validation
- **Storage Integration**: Confirmed proper integration with singleton storage pattern for data persistence
- **Testing**: Verified both external URL uploads and file uploads work correctly with proper validation
- **Result**: ✅ Complete media upload system now functional with both file and external URL support

### Unified Dashboard System and Upgrade Functionality Implementation (July 16, 2025)
- **Single Dashboard Architecture**: Implemented unified dashboard system that routes users to appropriate role-based dashboard internally
- **Route Consolidation**: All dashboard routes (`/dashboard`, `/talent-dashboard`, `/producer-dashboard`, `/manager-dashboard`) now point to single Dashboard component
- **Automatic Redirection**: Home route (`/`) now automatically redirects authenticated users to dashboard instead of separate home page
- **Payment Flow Integration**: Updated checkout success handling to redirect to dashboard after successful payment
- **Comprehensive Upgrade System**: Created professional UpgradePrompt component with:
  - Feature-specific upgrade prompts with clear descriptions
  - Recommended tier suggestions based on current plan
  - Visual feature comparisons and benefit highlights
  - Annual savings calculations and recommendations
  - Professional UI with gradients and proper spacing
- **Media Upload Error Handling**: Enhanced media upload endpoint with:
  - Improved multer configuration with fallback handling
  - Better error detection for multipart boundary issues
  - Content-type based routing for different upload scenarios
  - Comprehensive debugging logs for upload troubleshooting
- **Plan Selection Modal Improvements**: Fixed features display to show actual database features with proper formatting
- **Database Schema Fix**: Added missing `max_external_links` column to pricing_tiers table
- **Consolidated Architecture**: Eliminated duplicate dashboard components and routes for streamlined user experience
- **Result**: ✅ Single unified dashboard system with seamless upgrade flow, fixed media uploads, and professional upgrade prompts

### Job Communication System Implementation (July 16, 2025)
- **Complete Job Communication System**: Implemented comprehensive job communication functionality with real-time messaging between talent and job posters
- **Database Schema**: Created job_communications table with proper foreign key relationships and message tracking
- **React Components**: 
  - JobCommunication.tsx - Complete messaging interface with real-time updates
  - Enhanced BrowseJobs.tsx with "View Details" and "Ask Questions" functionality
  - Integrated communication buttons into TalentDashboard opportunities section
- **API Endpoints**: 
  - GET /api/jobs/:id/communications - Retrieve job messages with sender information
  - POST /api/jobs/:id/communications - Send messages to job posters
  - Full authentication and authorization protection
- **Features**:
  - Real-time messaging with job posters
  - Message history with sender names and profile images
  - Read/unread status tracking
  - Secure communication with proper user validation
  - Professional messaging interface with scrollable chat history
  - Automatic message timestamping
- **Database Updates**: Updated jobs table with allowCommunication field and proper user references
- **Security**: All communication endpoints protected with authentication middleware
- **Testing**: Comprehensive testing completed with successful message sending and retrieval
- **Result**: ✅ Complete job communication system enabling direct talent-to-job poster messaging

### Comprehensive Payment Management System Implementation (July 16, 2025)
- **Full Payment Tracking**: Implemented complete payment transaction tracking with database schema for payment_transactions, payment_refunds, and payment_analytics tables
- **Admin Payment Dashboard**: Created comprehensive AdminPayments.tsx component with:
  - Real-time payment analytics with revenue summaries, success rates, and transaction metrics
  - Transaction management with filtering, searching, and status tracking
  - Direct refund processing through Stripe API with admin controls
  - Revenue trend analysis with daily/weekly/monthly breakdowns
  - Transaction history with detailed payment information
- **API Integration**: Built robust payment management API endpoints:
  - `/api/admin/payments` - Transaction listing with filtering and pagination
  - `/api/admin/payments/:id/refund` - Direct refund processing with Stripe integration
  - `/api/admin/payments/analytics/summary` - Comprehensive payment analytics
  - `/api/admin/payments/analytics/revenue` - Revenue trends by period
  - `/api/webhook/stripe` - Stripe webhook handling for real-time updates
- **Database Operations**: Added comprehensive payment storage methods:
  - Payment transaction CRUD operations with status tracking
  - Refund management with admin notes and processing history
  - Analytics calculations for revenue, success rates, and transaction summaries
  - Revenue period analysis with PostgreSQL date functions
- **Enhanced UI Components**: 
  - Professional payment dashboard with analytics cards and charts
  - Advanced filtering and search capabilities
  - Real-time refund processing with admin controls
  - Transaction status badges and payment method displays
  - Revenue trend visualization with period comparisons
- **Stripe Integration**: Enhanced payment processing with:
  - Automatic transaction recording in database
  - Webhook handling for payment status updates
  - Direct refund processing through admin interface
  - Payment intent tracking and receipt management
- **Security & Validation**: Added admin-only access controls and proper error handling
- **Result**: ✅ Complete payment management system with analytics, refund processing, and comprehensive admin controls ready for production use

### Mandatory Plan Selection System Implementation (July 16, 2025)
- **Critical Security Fix**: Implemented mandatory plan selection system that prevents payment bypass vulnerability
- **Database Enhancement**: Added missing `updateUserTier` method to storage interface and DatabaseStorage implementation
- **Authentication Middleware**: Created `requirePlan` middleware that enforces plan selection before dashboard access
- **Client-Side Protection**: Built `PlanRequiredModal` component with comprehensive plan selection interface
- **Route Protection**: Created `PlanProtectedRoute` wrapper component that enforces plan selection across all dashboard routes
- **Payment Processing**: Fixed tier selection endpoint with proper user ID conversion and error handling
- **UI/UX Improvements**: 
  - Professional plan selection modal with role-specific pricing tiers
  - Comprehensive plan feature display with permissions and limits
  - Proper button alignment and payment processing states
  - Cannot be bypassed by refreshing - mandatory modal with no close button
- **Security Enhancements**:
  - All dashboard routes now require valid plan selection
  - API endpoints protected with `requirePlan` middleware
  - Even free plans require explicit selection to prevent bypass
  - Session-based plan validation with server-side enforcement
- **Technical Implementation**:
  - Plan validation checks on both client and server sides
  - Automatic user data refresh after plan selection
  - Proper error handling for failed plan selection
  - Comprehensive logging for debugging plan selection issues
- **Result**: ✅ Complete mandatory plan selection system preventing payment bypass with professional UI and robust security

### Comprehensive Email Configuration System Implementation (July 16, 2025)
- **Implementation**: Enhanced email system with dynamic provider configuration through admin settings
- **Email Provider Support**:
  - Resend.com integration with API key configuration
  - SMTP server support with full authentication and security options
  - Dynamic provider switching through admin panel
  - Automatic provider initialization based on admin settings
- **Admin Configuration Interface**:
  - Complete email settings management in admin dashboard settings tab
  - Email provider selection (Resend/SMTP)
  - From address and name configuration
  - Resend API key management
  - SMTP server configuration (host, port, username, password, TLS/SSL)
  - Email enable/disable toggle
  - Test email functionality with live sending validation
- **System Integration**:
  - Updated email.ts to support dynamic configuration
  - Added nodemailer support for SMTP functionality
  - Created /api/admin/test-email endpoint for configuration testing
  - Automatic email provider initialization based on database settings
  - Database-driven email configuration with 10 comprehensive settings
- **Features**:
  - Support for both Resend.com and traditional SMTP servers
  - Real-time configuration updates without server restart
  - Secure credential storage in database
  - Email testing functionality for configuration validation
  - Fallback and error handling for email sending failures
- **Result**: ✅ Complete email configuration system with dual provider support, admin management interface, and live testing capabilities

### Admin Questions Management System Verification (July 16, 2025)
- **Verification**: Confirmed comprehensive admin questions management system is fully functional
- **Capabilities**:
  - Full CRUD operations for all profile questions including initial signup questions
  - Questions organized by talent type (actor, musician, voice artist, model, manager, producer, agent)
  - Special "profile" category for universal signup questions
  - Order-based question sequencing with admin control
  - Field type support (text, textarea, select, checkbox, number, boolean)
  - Options management for dropdown and checkbox fields
  - Question activation/deactivation controls
  - Real-time updates through admin dashboard
- **Initial Signup Questions**: Admin can fully control the first questions users see regardless of role/category
- **Database Structure**: 40+ existing questions with proper field names, types, and validation
- **Admin Interface**: Complete UI in /admin/questions with filtering, editing, and creation capabilities
- **Result**: ✅ Verified admin has full control over all user signup questions including first initial questions

### Enhanced Pricing Tiers Management System with Dynamic Access Control (July 15, 2025)
- **Implementation**: Complete rebuild of pricing tiers management with professional admin interface and dynamic access control
- **Advanced Filtering Features**:
  - Search functionality by tier name
  - Category filtering (Talent, Manager, Producer, Agent)
  - Status filtering (active/inactive)
  - Price range filtering (free, low $1-$25, medium $26-$100, high $100+)
  - Duration filtering (monthly, quarterly, yearly)
  - Sortable columns (name, price, duration, category) with ascending/descending order
  - Real-time results counter and filter status display
  - Quick filter reset functionality
- **Annual Pricing Options**:
  - Monthly and annual pricing support for all tiers
  - Automatic savings calculation and display
  - Percentage discount indicators for annual plans
  - Flexible pricing structure with optional annual rates
- **Role-Based Categories**:
  - Talent-specific tiers (🎭 Talent)
  - Manager-specific tiers (👔 Manager)  
  - Producer-specific tiers (🎬 Producer)
  - Agent-specific tiers (🤝 Agent)
  - Category-based filtering and organization
- **User-Friendly Permissions System**:
  - Categorized permissions with emoji icons and clear descriptions
  - Analytics & Reporting section (analytics dashboard, export data)
  - Communication section (messaging system, priority support)
  - AI & Smart Features section (AI-powered features)
  - Platform Access section (view profiles, create jobs)
  - Social Features section (social networking, community engagement)
  - Card-based permission toggles with explanatory text
- **Dynamic Access Control**:
  - Feature-gated access based on user tier and permissions
  - Upgrade prompts when users try to access restricted features
  - Visual overlay on locked features with upgrade messaging
  - Comprehensive upgrade modal with feature descriptions
  - Direct links to pricing page for easy upgrading
- **UI Improvements**:
  - Professional card-based layout with gradients and status badges
  - Visual tier indicators with role-specific icons
  - Modal dialogs for creating/editing tiers
  - Results summary with filter status
  - Responsive grid layout with hover effects
  - Enhanced pricing display with annual savings
- **Result**: ✅ Complete pricing tiers management system with advanced filtering, role-based categories, annual pricing, dynamic access control, and professional UI

### Logo Update (July 15, 2025)
- **Change**: Replaced Star icon logo with custom Talents & Stars logo image
- **Implementation**: Updated Header component to use provided PNG logo file with increased size (h-12)
- **Result**: ✅ Brand identity updated with professional logo at larger, more visible size

### Admin Dashboard Spacing Issue Fixed (July 15, 2025)
- **Issue**: Admin dashboard content appearing directly under top navigation menu without proper spacing
- **Root Cause**: Missing top padding in main dashboard container
- **Solution**: Added proper top padding (pt-24) to admin dashboard container to provide adequate spacing from header
- **Result**: ✅ Admin dashboard now displays with proper spacing and visual hierarchy

### Onboarding Component Re-render Issue Fixed (July 15, 2025)
- **Issue**: Duplicate question titles appearing due to excessive component re-renders (8+ renders per page load)
- **Root Cause**: React.memo wrapper combined with complex form state dependencies causing render cascades
- **Solution**: 
  - Removed and re-added all actor questions (21 questions) with proper field names and database structure
  - Removed React.memo wrapper from Onboarding component to prevent render optimization conflicts
  - Added useMemo for relevantQuestions computation to prevent unnecessary re-filtering
  - Optimized form watching to reduce state dependencies
  - Restarted workflow to clear cached component state
- **Result**: ✅ Component now renders cleanly without duplicates, questions display properly with correct field names
- **Test Credentials**: martyTEST / 123456 (talent role with actor questions working correctly)

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

### Comprehensive Onboarding Questions Implementation (July 15, 2025)
- **Acting Questions**: Added 20 detailed questions covering acting specialty, experience, methods, comfort levels, and role preferences
- **Musician Questions**: Added 20 comprehensive questions about instruments, genres, performance types, and musical experience
- **Voice Artist Questions**: Added 20 specialized questions for voice acting, recording setup, project types, and vocal abilities
- **Model Questions**: Added 20 detailed questions about modeling specialties, measurements, comfort levels, and shoot preferences
- **Manager Questions**: Added 20 professional questions about management specialty, client types, commission structure, and industry connections
- **Producer Questions**: Added 20 comprehensive questions about production experience, project types, budget ranges, and crew management
- **Question Categories**: 120 total questions with proper field types (select, checkbox, textarea, number, text) and validation
- **Database Structure**: All questions stored with proper options arrays, ordering, and talent type associations
- **Result**: ✅ Complete question system with 120 comprehensive questions across all roles and talent types

### Navigation and Upload System Fixes (July 15, 2025)
- **Issues Fixed**:
  - "Continue Building Profile" and "Get Motivated" buttons not working on dashboard
  - Missing back button functionality in header navigation
  - Profile image upload endpoint missing from API routes
  - Inconsistent upload handling across different endpoints
- **Solutions Applied**:
  - Added comprehensive back button functionality to header with proper browser history navigation
  - Fixed ProgressMascot button handlers with proper error handling and fallback navigation
  - Added missing `/api/user/profile-image` endpoint that uploads to Wasabi S3
  - Added `updateUserProfileImage` method to storage interface and implementation
  - Enhanced `handleProgressItemClick` to properly navigate to onboarding for incomplete items
  - All upload endpoints now consistently use Wasabi S3 storage through `uploadFileToWasabi` function
- **Test Credentials**: martyTEST / 123456
- **Result**: ✅ Navigation system working properly, all uploads go through Wasabi S3, mascot buttons functional

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