-- Data Export Script for Migration
-- Run this to export your current data before migration

-- Export users (with password hashes for authentication)
COPY (
  SELECT id, username, password, email, first_name, last_name, 
         profile_image_url, role, pricing_tier_id, created_at, updated_at
  FROM users 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export user profiles
COPY (
  SELECT id, user_id, role, talent_type, display_name, bio, location, website,
         phone_number, social_links, is_verified, availability_status,
         height, weight, eye_color, hair_color, union_status, languages,
         accents, instruments, genres, skills, daily_rate, weekly_rate,
         project_rate, questionnaire_responses, primary_specialty, years_experience,
         acting_method, improvisation_comfort, stage_combat, intimate_scenes_comfort,
         role_types, motion_capture, animal_work, crying_on_cue, period_pieces,
         physical_comedy, accent_experience, green_screen, stunt_comfort,
         shakespeare_experience, musical_theater, horror_thriller, current_agent,
         current_publicist, representation_status, profile_views, is_featured,
         created_at, updated_at
  FROM user_profiles 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export jobs/gigs
COPY (
  SELECT id, user_id, title, description, talent_type, location, budget,
         project_date, requirements, status, is_public, allow_communication,
         created_at, updated_at
  FROM jobs 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export pricing tiers
COPY (
  SELECT id, name, price, duration, features, is_active
  FROM pricing_tiers 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export media files
COPY (
  SELECT id, user_id, file_name, file_type, file_size, url, category,
         description, is_public, created_at, updated_at
  FROM media_files 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export social media links
COPY (
  SELECT id, user_id, platform, url, followers_count, is_verified,
         created_at, updated_at
  FROM social_media_links 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Export admin settings
COPY (
  SELECT id, key, value, description, category, created_at, updated_at
  FROM admin_settings 
  ORDER BY id
) TO STDOUT WITH CSV HEADER;