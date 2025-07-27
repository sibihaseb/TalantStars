-- Supabase Schema Migration for Talents & Stars Platform
-- This file contains the complete database schema for migration to Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('talent', 'manager', 'producer', 'admin', 'super_admin');
CREATE TYPE talent_type AS ENUM ('actor', 'musician', 'voice_artist', 'model', 'profile');
CREATE TYPE pricing_tier_category AS ENUM ('talent', 'manager', 'producer', 'agent');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url TEXT,
    role user_role DEFAULT 'talent',
    pricing_tier_id INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing tiers table
CREATE TABLE pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category pricing_tier_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(50) DEFAULT 'monthly',
    max_photos INTEGER DEFAULT 10,
    max_videos INTEGER DEFAULT 5,
    max_audio INTEGER DEFAULT 5,
    max_external_links INTEGER DEFAULT 3,
    features JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table (comprehensive talent management)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'talent',
    talent_type talent_type DEFAULT 'actor',
    display_name VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    phone_number VARCHAR(50),
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    availability_status VARCHAR(50) DEFAULT 'available',
    
    -- Physical attributes
    height VARCHAR(20),
    weight VARCHAR(20),
    eye_color TEXT[],
    hair_color TEXT[],
    shoe_size VARCHAR(10),
    
    -- Skills and experience
    languages TEXT[],
    accents TEXT[],
    instruments TEXT[],
    genres TEXT[],
    vocal_range TEXT[],
    union_status TEXT[],
    skills TEXT[],
    
    -- Work details
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    project_rate DECIMAL(10,2),
    
    -- Additional fields
    body_stats TEXT,
    walk_type VARCHAR(100),
    affiliations TEXT[],
    stunts TEXT[],
    activities TEXT[],
    awards TEXT[],
    experiences TEXT[],
    wardrobe TEXT[],
    tattoos TEXT,
    piercings TEXT,
    scars TEXT,
    dancing_styles TEXT[],
    sporting_activities TEXT[],
    driving_licenses TEXT[],
    
    -- Files
    resume TEXT,
    credits TEXT,
    representations TEXT,
    
    -- Acting-specific questionnaire fields
    questionnaire_responses JSONB DEFAULT '{}',
    primary_specialty TEXT[],
    years_experience VARCHAR(10),
    acting_method TEXT[],
    improvisation_comfort VARCHAR(50),
    stage_combat VARCHAR(50),
    intimate_scenes_comfort VARCHAR(50),
    role_types TEXT[],
    motion_capture VARCHAR(50),
    animal_work VARCHAR(50),
    crying_on_cue VARCHAR(50),
    period_pieces VARCHAR(50),
    physical_comedy VARCHAR(50),
    accent_experience VARCHAR(50),
    green_screen VARCHAR(50),
    stunt_comfort VARCHAR(50),
    shakespeare_experience VARCHAR(50),
    musical_theater VARCHAR(50),
    horror_thriller TEXT[],
    current_agent VARCHAR(255),
    current_publicist VARCHAR(255),
    representation_status VARCHAR(50),
    
    -- Metadata
    profile_views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMP,
    featured_tier VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table (gigs/opportunities)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255),
    talent_type talent_type,
    location VARCHAR(255),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    project_date DATE,
    application_deadline DATE,
    requirements TEXT,
    status VARCHAR(50) DEFAULT 'open',
    created_by INTEGER REFERENCES users(id),
    
    -- Entertainment industry specific fields
    project_type VARCHAR(100),
    genre VARCHAR(100),
    age_range_min INTEGER,
    age_range_max INTEGER,
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    experience_level VARCHAR(50),
    shooting_days INTEGER,
    union_status VARCHAR(100),
    special_skills TEXT,
    wardrobe_notes TEXT,
    location_details TEXT,
    transportation_provided BOOLEAN DEFAULT FALSE,
    meals_provided BOOLEAN DEFAULT FALSE,
    accommodation_provided BOOLEAN DEFAULT FALSE,
    direct_communication BOOLEAN DEFAULT TRUE,
    remote_work_available BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media files table
CREATE TABLE media_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    url TEXT NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications table
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    user_id INTEGER REFERENCES users(id),
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    notes TEXT
);

-- Job communications table
CREATE TABLE job_communications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Availability calendar table
CREATE TABLE availability_calendar (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social media links table
CREATE TABLE social_media_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    followers_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin settings table
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile questions table (for questionnaires)
CREATE TABLE profile_questions (
    id SERIAL PRIMARY KEY,
    talent_type talent_type NOT NULL,
    question TEXT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(100) NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    options TEXT[],
    order_index INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questionnaire responses table
CREATE TABLE questionnaire_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES profile_questions(id),
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo codes table
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    valid_from DATE,
    valid_until DATE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    session_data TEXT NOT NULL,
    expires TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_talent_type ON user_profiles(talent_type);
CREATE INDEX idx_jobs_talent_type ON jobs(talent_type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_media_files_user_id ON media_files(user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_availability_calendar_user_id ON availability_calendar(user_id);
CREATE INDEX idx_availability_calendar_date ON availability_calendar(event_date);
CREATE INDEX idx_social_media_links_user_id ON social_media_links(user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, category, price, max_photos, max_videos, max_audio, max_external_links, features) VALUES
('Basic Talent', 'talent', 9.99, 5, 2, 2, 2, '{"profile_templates": 1, "messaging": true, "calendar": true}'),
('Professional Talent', 'talent', 19.99, 15, 5, 5, 5, '{"profile_templates": 3, "messaging": true, "calendar": true, "analytics": true}'),
('Enterprise Talent', 'talent', 39.99, 50, 20, 20, 10, '{"profile_templates": 5, "messaging": true, "calendar": true, "analytics": true, "priority_support": true}'),
('Basic Manager', 'manager', 29.99, 10, 5, 3, 5, '{"talent_search": true, "messaging": true, "client_management": true}'),
('Professional Manager', 'manager', 59.99, 25, 10, 8, 10, '{"talent_search": true, "messaging": true, "client_management": true, "analytics": true}'),
('Enterprise Manager', 'manager', 99.99, 100, 50, 30, 20, '{"talent_search": true, "messaging": true, "client_management": true, "analytics": true, "white_label": true}'),
('Basic Producer', 'producer', 49.99, 20, 10, 5, 8, '{"project_management": true, "talent_search": true, "messaging": true}'),
('Professional Producer', 'producer', 99.99, 50, 25, 15, 15, '{"project_management": true, "talent_search": true, "messaging": true, "analytics": true}'),
('Enterprise Producer', 'producer', 199.99, 200, 100, 50, 30, '{"project_management": true, "talent_search": true, "messaging": true, "analytics": true, "priority_support": true}'),
('Basic Agent', 'agent', 39.99, 15, 8, 5, 8, '{"client_management": true, "talent_search": true, "messaging": true}'),
('Professional Agent', 'agent', 79.99, 40, 20, 12, 15, '{"client_management": true, "talent_search": true, "messaging": true, "analytics": true}'),
('Enterprise Agent', 'agent', 159.99, 150, 75, 40, 25, '{"client_management": true, "talent_search": true, "messaging": true, "analytics": true, "priority_support": true}');

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description, category) VALUES
('session_duration_hours', '168', 'Session duration in hours (168 = 7 days)', 'authentication'),
('max_file_size_mb', '50', 'Maximum file upload size in MB', 'uploads'),
('maintenance_mode', 'false', 'Enable maintenance mode', 'system'),
('registration_enabled', 'true', 'Allow new user registration', 'authentication');

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_pricing_tier 
    FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers(id);

-- Create RLS (Row Level Security) policies for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your security requirements)
CREATE POLICY "Users can view their own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Profiles are viewable by authenticated users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Media files are viewable by authenticated users" ON media_files
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own media files" ON media_files
    FOR ALL USING (auth.uid()::text = user_id::text);