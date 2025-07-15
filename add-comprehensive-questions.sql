-- Clear existing questions first
DELETE FROM profile_questions;

-- ============================================
-- ACTING QUESTIONS (actor talent type)
-- ============================================

-- Basic Acting Questions
INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('actor', 'What is your primary acting specialty?', 'acting_specialty', 'select', true, 1, true),
('actor', 'How many years of acting experience do you have?', 'acting_experience_years', 'number', true, 2, true),
('actor', 'What is your preferred acting method or technique?', 'acting_method', 'select', false, 3, true),
('actor', 'Are you comfortable with improvisation?', 'improvisation_comfort', 'select', true, 4, true),
('actor', 'Do you have stage combat training?', 'stage_combat', 'select', false, 5, true),
('actor', 'Are you comfortable with intimate scenes?', 'intimate_scenes', 'select', true, 6, true),
('actor', 'What types of roles are you most interested in?', 'preferred_roles', 'checkbox', true, 7, true),
('actor', 'Do you have experience with motion capture?', 'motion_capture', 'select', false, 8, true),
('actor', 'Are you comfortable working with animals?', 'animals_comfort', 'select', false, 9, true),
('actor', 'What is your comfort level with crying on cue?', 'crying_on_cue', 'select', true, 10, true),
('actor', 'Do you have experience with period pieces?', 'period_pieces', 'select', false, 11, true),
('actor', 'Are you comfortable with physical comedy?', 'physical_comedy', 'select', false, 12, true),
('actor', 'What is your experience with different accents?', 'accent_experience', 'textarea', false, 13, true),
('actor', 'Do you have experience with green screen work?', 'green_screen', 'select', false, 14, true),
('actor', 'Are you comfortable with stunts?', 'stunt_comfort', 'select', true, 15, true),
('actor', 'What is your experience with Shakespeare?', 'shakespeare_experience', 'select', false, 16, true),
('actor', 'Do you have experience with musical theater?', 'musical_theater', 'select', false, 17, true),
('actor', 'Are you comfortable with nudity (if required by role)?', 'nudity_comfort', 'select', true, 18, true),
('actor', 'What is your experience with children actors?', 'children_experience', 'select', false, 19, true),
('actor', 'Do you have experience with horror/thriller genres?', 'horror_experience', 'select', false, 20, true);

-- Acting Specialty Options
UPDATE profile_questions SET options = ARRAY['Film/TV Drama', 'Comedy', 'Action/Adventure', 'Horror/Thriller', 'Romance', 'Science Fiction', 'Fantasy', 'Historical/Period', 'Independent Films', 'Theater', 'Musical Theater', 'Voice Acting', 'Commercial Acting'] WHERE field_name = 'acting_specialty';

-- Acting Method Options
UPDATE profile_questions SET options = ARRAY['Method Acting', 'Meisner Technique', 'Stella Adler', 'Stanislavski', 'Lee Strasberg', 'Practical Aesthetics', 'Classical Training', 'No specific method', 'Multiple techniques'] WHERE field_name = 'acting_method';

-- Comfort Level Options (for various fields)
UPDATE profile_questions SET options = ARRAY['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable', 'Never tried but willing'] WHERE field_name IN ('improvisation_comfort', 'intimate_scenes', 'crying_on_cue', 'physical_comedy', 'stunt_comfort', 'nudity_comfort');

-- Experience Level Options
UPDATE profile_questions SET options = ARRAY['Extensive experience', 'Some experience', 'Limited experience', 'No experience but willing to learn', 'No experience and not interested'] WHERE field_name IN ('stage_combat', 'motion_capture', 'animals_comfort', 'period_pieces', 'green_screen', 'shakespeare_experience', 'musical_theater', 'children_experience', 'horror_experience');

-- Preferred Roles (checkbox)
UPDATE profile_questions SET options = ARRAY['Leading roles', 'Supporting roles', 'Character roles', 'Villain roles', 'Romantic leads', 'Action heroes', 'Comedic roles', 'Dramatic roles', 'Voice-over roles', 'Background/Extra work'] WHERE field_name = 'preferred_roles';

-- ============================================
-- MUSICIAN QUESTIONS (musician talent type)
-- ============================================

INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('musician', 'What is your primary musical instrument?', 'primary_instrument', 'select', true, 1, true),
('musician', 'How many years of musical experience do you have?', 'music_experience_years', 'number', true, 2, true),
('musician', 'What genres do you specialize in?', 'music_genres', 'checkbox', true, 3, true),
('musician', 'Can you read music notation?', 'music_notation', 'select', true, 4, true),
('musician', 'Do you have formal musical training?', 'formal_training', 'select', false, 5, true),
('musician', 'Are you comfortable with live performances?', 'live_performance', 'select', true, 6, true),
('musician', 'Do you have recording studio experience?', 'studio_experience', 'select', false, 7, true),
('musician', 'Are you comfortable with improvisation?', 'music_improvisation', 'select', true, 8, true),
('musician', 'What is your vocal range (if applicable)?', 'vocal_range_detail', 'select', false, 9, true),
('musician', 'Do you play in a band or as a solo artist?', 'performance_type', 'select', true, 10, true),
('musician', 'Are you comfortable with touring?', 'touring_comfort', 'select', true, 11, true),
('musician', 'Do you have experience with digital music production?', 'digital_production', 'select', false, 12, true),
('musician', 'What secondary instruments can you play?', 'secondary_instruments', 'checkbox', false, 13, true),
('musician', 'Are you comfortable performing for different age groups?', 'age_groups', 'select', true, 14, true),
('musician', 'Do you have experience with music therapy?', 'music_therapy', 'select', false, 15, true),
('musician', 'Are you comfortable with session work?', 'session_work', 'select', true, 16, true),
('musician', 'What is your experience with different musical styles?', 'musical_styles', 'textarea', false, 17, true),
('musician', 'Do you have experience teaching music?', 'teaching_experience', 'select', false, 18, true),
('musician', 'Are you comfortable with collaborative songwriting?', 'collaborative_writing', 'select', true, 19, true),
('musician', 'What is your preferred performance setting?', 'performance_setting', 'select', true, 20, true);

-- Music Genre Options
UPDATE profile_questions SET options = ARRAY['Pop', 'Rock', 'Jazz', 'Classical', 'Country', 'Hip-Hop/Rap', 'Electronic', 'Folk', 'Blues', 'R&B/Soul', 'Alternative', 'Heavy Metal', 'Indie', 'Reggae', 'World Music', 'Gospel', 'Punk', 'Funk', 'Experimental'] WHERE field_name = 'music_genres';

-- Primary Instrument Options
UPDATE profile_questions SET options = ARRAY['Vocals', 'Guitar', 'Piano/Keyboard', 'Drums', 'Bass', 'Violin', 'Saxophone', 'Trumpet', 'Flute', 'Cello', 'Clarinet', 'Trombone', 'Percussion', 'Harp', 'Banjo', 'Mandolin', 'Harmonica', 'Accordion', 'Other'] WHERE field_name = 'primary_instrument';

-- Secondary Instruments (checkbox)
UPDATE profile_questions SET options = ARRAY['Vocals', 'Guitar', 'Piano/Keyboard', 'Drums', 'Bass', 'Violin', 'Saxophone', 'Trumpet', 'Flute', 'Cello', 'Clarinet', 'Trombone', 'Percussion', 'Harp', 'Banjo', 'Mandolin', 'Harmonica', 'Accordion'] WHERE field_name = 'secondary_instruments';

-- Vocal Range Options
UPDATE profile_questions SET options = ARRAY['Soprano', 'Mezzo-soprano', 'Alto', 'Tenor', 'Baritone', 'Bass', 'Coloratura', 'Contralto', 'Countertenor', 'Not applicable'] WHERE field_name = 'vocal_range_detail';

-- Music Comfort/Experience Options
UPDATE profile_questions SET options = ARRAY['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable', 'Never tried but willing'] WHERE field_name IN ('live_performance', 'music_improvisation', 'touring_comfort', 'session_work', 'collaborative_writing');

-- Music Yes/No Options
UPDATE profile_questions SET options = ARRAY['Yes, extensively', 'Yes, some experience', 'Limited experience', 'No experience but interested', 'No experience and not interested'] WHERE field_name IN ('studio_experience', 'digital_production', 'music_therapy', 'teaching_experience');

-- Music Notation Options
UPDATE profile_questions SET options = ARRAY['Yes, fluently', 'Yes, basically', 'Somewhat', 'No, but willing to learn', 'No and not interested'] WHERE field_name = 'music_notation';

-- Performance Type Options
UPDATE profile_questions SET options = ARRAY['Solo artist', 'Band member', 'Both solo and band', 'Session musician', 'Backup vocalist', 'Orchestra member', 'Varies by project'] WHERE field_name = 'performance_type';

-- Performance Setting Options
UPDATE profile_questions SET options = ARRAY['Large venues/stadiums', 'Small venues/clubs', 'Concert halls', 'Outdoor festivals', 'Private events', 'Recording studios', 'Street performances', 'Online/virtual', 'No preference'] WHERE field_name = 'performance_setting';

-- ============================================
-- VOICE ARTIST QUESTIONS (voice_artist talent type)
-- ============================================

INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('voice_artist', 'What is your primary voice acting specialty?', 'voice_specialty', 'select', true, 1, true),
('voice_artist', 'How many years of voice acting experience do you have?', 'voice_experience_years', 'number', true, 2, true),
('voice_artist', 'What is your vocal range?', 'voice_range', 'select', true, 3, true),
('voice_artist', 'Are you comfortable with character voices?', 'character_voices', 'select', true, 4, true),
('voice_artist', 'Do you have experience with different accents?', 'voice_accents', 'select', true, 5, true),
('voice_artist', 'Are you comfortable with singing in voice roles?', 'voice_singing', 'select', false, 6, true),
('voice_artist', 'What types of projects interest you most?', 'voice_projects', 'checkbox', true, 7, true),
('voice_artist', 'Do you have a home recording setup?', 'home_recording', 'select', true, 8, true),
('voice_artist', 'Are you comfortable with long recording sessions?', 'long_sessions', 'select', true, 9, true),
('voice_artist', 'Do you have experience with live voice work?', 'live_voice_work', 'select', false, 10, true),
('voice_artist', 'What is your experience with different age ranges?', 'voice_age_ranges', 'checkbox', true, 11, true),
('voice_artist', 'Are you comfortable with adult content (if appropriate)?', 'adult_content_voice', 'select', true, 12, true),
('voice_artist', 'Do you have experience with video game voice acting?', 'video_game_voice', 'select', false, 13, true),
('voice_artist', 'Are you comfortable with emotional scenes?', 'emotional_voice_scenes', 'select', true, 14, true),
('voice_artist', 'What is your experience with commercial voice work?', 'commercial_voice', 'select', false, 15, true),
('voice_artist', 'Do you have experience with audiobook narration?', 'audiobook_narration', 'select', false, 16, true),
('voice_artist', 'Are you comfortable with technical/educational content?', 'technical_content', 'select', true, 17, true),
('voice_artist', 'What is your turnaround time for projects?', 'turnaround_time', 'select', true, 18, true),
('voice_artist', 'Do you have experience with multiple languages?', 'multilingual_voice', 'select', false, 19, true),
('voice_artist', 'Are you comfortable with improvisation in voice work?', 'voice_improvisation', 'select', true, 20, true);

-- Voice Specialty Options
UPDATE profile_questions SET options = ARRAY['Commercial/Advertising', 'Animation/Cartoon', 'Video Games', 'Audiobooks', 'E-learning/Educational', 'Documentary', 'IVR/Phone Systems', 'Podcast/Radio', 'Film/TV Dubbing', 'Character Work', 'Narration', 'Corporate/Training'] WHERE field_name = 'voice_specialty';

-- Voice Range Options
UPDATE profile_questions SET options = ARRAY['Very high', 'High', 'Medium-high', 'Medium', 'Medium-low', 'Low', 'Very low', 'Wide range'] WHERE field_name = 'voice_range';

-- Voice Projects (checkbox)
UPDATE profile_questions SET options = ARRAY['TV/Radio Commercials', 'Animated Films/TV', 'Video Games', 'Audiobooks', 'E-learning', 'Documentary', 'Corporate Training', 'Phone Systems', 'Podcast/Radio', 'Film Dubbing', 'Character Work', 'Narration'] WHERE field_name = 'voice_projects';

-- Voice Age Ranges (checkbox)
UPDATE profile_questions SET options = ARRAY['Child (5-12)', 'Teen (13-17)', 'Young Adult (18-25)', 'Adult (26-40)', 'Middle Age (41-60)', 'Senior (60+)', 'Elderly (70+)'] WHERE field_name = 'voice_age_ranges';

-- Voice Comfort Options
UPDATE profile_questions SET options = ARRAY['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable', 'Never tried but willing'] WHERE field_name IN ('character_voices', 'voice_singing', 'long_sessions', 'adult_content_voice', 'emotional_voice_scenes', 'technical_content', 'voice_improvisation');

-- Voice Experience Options
UPDATE profile_questions SET options = ARRAY['Extensive experience', 'Some experience', 'Limited experience', 'No experience but willing to learn', 'No experience and not interested'] WHERE field_name IN ('voice_accents', 'live_voice_work', 'video_game_voice', 'commercial_voice', 'audiobook_narration', 'multilingual_voice');

-- Home Recording Options
UPDATE profile_questions SET options = ARRAY['Professional setup', 'Good quality setup', 'Basic setup', 'No setup but can get one', 'No setup and not planning to get one'] WHERE field_name = 'home_recording';

-- Turnaround Time Options
UPDATE profile_questions SET options = ARRAY['Same day', '1-2 days', '3-5 days', '1 week', '2 weeks', 'Depends on project'] WHERE field_name = 'turnaround_time';

-- ============================================
-- MODEL QUESTIONS (model talent type)
-- ============================================

INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('model', 'What is your primary modeling specialty?', 'modeling_specialty', 'select', true, 1, true),
('model', 'How many years of modeling experience do you have?', 'modeling_experience_years', 'number', true, 2, true),
('model', 'What is your height?', 'model_height', 'text', true, 3, true),
('model', 'What are your measurements?', 'model_measurements', 'text', true, 4, true),
('model', 'What is your dress/suit size?', 'clothing_size', 'text', true, 5, true),
('model', 'Are you comfortable with swimwear modeling?', 'swimwear_comfort', 'select', true, 6, true),
('model', 'Are you comfortable with underwear/lingerie modeling?', 'lingerie_comfort', 'select', true, 7, true),
('model', 'Are you comfortable with nude/artistic modeling?', 'nude_modeling', 'select', true, 8, true),
('model', 'What types of modeling work interest you?', 'modeling_types', 'checkbox', true, 9, true),
('model', 'Do you have experience with runway modeling?', 'runway_experience', 'select', false, 10, true),
('model', 'Are you comfortable with travel for shoots?', 'travel_comfort', 'select', true, 11, true),
('model', 'Do you have experience with commercial modeling?', 'commercial_modeling', 'select', false, 12, true),
('model', 'Are you comfortable with long photo shoots?', 'long_shoots', 'select', true, 13, true),
('model', 'Do you have experience with video/motion work?', 'video_modeling', 'select', false, 14, true),
('model', 'Are you comfortable working with multiple photographers?', 'multiple_photographers', 'select', true, 15, true),
('model', 'What is your experience with different poses/styles?', 'pose_experience', 'select', true, 16, true),
('model', 'Are you comfortable with makeup/styling changes?', 'styling_changes', 'select', true, 17, true),
('model', 'Do you have experience with product modeling?', 'product_modeling', 'select', false, 18, true),
('model', 'Are you comfortable with outdoor shoots?', 'outdoor_shoots', 'select', true, 19, true),
('model', 'What is your availability for shoots?', 'shoot_availability', 'select', true, 20, true);

-- Modeling Specialty Options
UPDATE profile_questions SET options = ARRAY['Fashion/Editorial', 'Commercial/Lifestyle', 'Fitness/Athletic', 'Plus Size', 'Petite', 'Runway/Catwalk', 'Swimwear', 'Lingerie', 'Parts Modeling', 'Alternative/Artistic', 'Glamour', 'Catalogue'] WHERE field_name = 'modeling_specialty';

-- Modeling Types (checkbox)
UPDATE profile_questions SET options = ARRAY['Fashion shoots', 'Commercial/lifestyle', 'Fitness/sports', 'Beauty/cosmetics', 'Product modeling', 'Runway shows', 'Trade shows', 'Catalog work', 'Stock photography', 'Art/creative shoots', 'Music videos', 'Television commercials'] WHERE field_name = 'modeling_types';

-- Modeling Comfort Options
UPDATE profile_questions SET options = ARRAY['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable', 'Depends on context'] WHERE field_name IN ('swimwear_comfort', 'lingerie_comfort', 'nude_modeling', 'travel_comfort', 'long_shoots', 'multiple_photographers', 'styling_changes', 'outdoor_shoots');

-- Modeling Experience Options
UPDATE profile_questions SET options = ARRAY['Extensive experience', 'Some experience', 'Limited experience', 'No experience but willing to learn', 'No experience and not interested'] WHERE field_name IN ('runway_experience', 'commercial_modeling', 'video_modeling', 'product_modeling');

-- Pose Experience Options
UPDATE profile_questions SET options = ARRAY['Very experienced', 'Experienced', 'Some experience', 'Basic experience', 'Beginner but willing to learn'] WHERE field_name = 'pose_experience';

-- Shoot Availability Options
UPDATE profile_questions SET options = ARRAY['Full-time available', 'Part-time available', 'Weekends only', 'Evenings only', 'Flexible schedule', 'Limited availability'] WHERE field_name = 'shoot_availability';

-- ============================================
-- MANAGER QUESTIONS (manager role)
-- ============================================

INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('profile', 'What is your primary management specialty?', 'management_specialty', 'select', true, 1, true),
('profile', 'How many years of talent management experience do you have?', 'management_experience_years', 'number', true, 2, true),
('profile', 'What types of talent do you prefer to manage?', 'talent_types_managed', 'checkbox', true, 3, true),
('profile', 'How many clients do you currently manage?', 'current_clients', 'number', false, 4, true),
('profile', 'What is your commission structure?', 'commission_structure', 'select', true, 5, true),
('profile', 'Do you have industry connections in specific markets?', 'industry_connections', 'checkbox', false, 6, true),
('profile', 'Are you comfortable with contract negotiations?', 'contract_negotiations', 'select', true, 7, true),
('profile', 'Do you provide career development guidance?', 'career_development', 'select', true, 8, true),
('profile', 'Are you available for emergency situations?', 'emergency_availability', 'select', true, 9, true),
('profile', 'What is your experience with different project types?', 'project_types_experience', 'checkbox', true, 10, true),
('profile', 'Do you handle financial planning for clients?', 'financial_planning', 'select', false, 11, true),
('profile', 'Are you comfortable with media relations?', 'media_relations', 'select', true, 12, true),
('profile', 'What is your approach to client communication?', 'communication_approach', 'select', true, 13, true),
('profile', 'Do you have experience with international projects?', 'international_experience', 'select', false, 14, true),
('profile', 'Are you comfortable with long-term client relationships?', 'longterm_relationships', 'select', true, 15, true),
('profile', 'What is your experience with different budget ranges?', 'budget_experience', 'checkbox', true, 16, true),
('profile', 'Do you provide marketing support for clients?', 'marketing_support', 'select', true, 17, true),
('profile', 'Are you comfortable with crisis management?', 'crisis_management', 'select', true, 18, true),
('profile', 'What is your preferred client capacity?', 'client_capacity', 'select', true, 19, true),
('profile', 'Do you have experience with digital/social media management?', 'social_media_management', 'select', false, 20, true);

-- Management Specialty Options
UPDATE profile_questions SET options = ARRAY['Talent Management', 'Booking Agent', 'Business Manager', 'Publicist', 'Career Consultant', 'Entertainment Lawyer', 'Creative Director', 'Brand Manager', 'Multi-service Manager'] WHERE field_name = 'management_specialty' AND talent_type = 'profile';

-- Talent Types Managed (checkbox)
UPDATE profile_questions SET options = ARRAY['Actors', 'Musicians', 'Voice Artists', 'Models', 'Directors', 'Writers', 'Producers', 'Comedians', 'Dancers', 'Influencers', 'Athletes', 'Other performers'] WHERE field_name = 'talent_types_managed';

-- Commission Structure Options
UPDATE profile_questions SET options = ARRAY['Standard 10%', '15%', '20%', 'Hourly rate', 'Project-based', 'Retainer + commission', 'Negotiable', 'Other arrangement'] WHERE field_name = 'commission_structure';

-- Industry Connections (checkbox)
UPDATE profile_questions SET options = ARRAY['Film/TV', 'Theater', 'Music Industry', 'Fashion/Modeling', 'Commercial/Advertising', 'Digital/Online', 'International Markets', 'Independent Projects', 'Corporate Events', 'Live Entertainment'] WHERE field_name = 'industry_connections';

-- Project Types Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Feature Films', 'Television', 'Theater', 'Commercials', 'Music Videos', 'Digital Content', 'Live Events', 'Corporate Projects', 'International Projects', 'Independent Films'] WHERE field_name = 'project_types_experience';

-- Budget Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Low budget (<$100K)', 'Medium budget ($100K-$1M)', 'High budget ($1M-$10M)', 'Major budget ($10M+)', 'Corporate budgets', 'Independent funding', 'Grant funding', 'Crowdfunded projects'] WHERE field_name = 'budget_experience';

-- Manager Comfort/Experience Options
UPDATE profile_questions SET options = ARRAY['Very comfortable/experienced', 'Comfortable/experienced', 'Some experience', 'Limited experience', 'No experience but willing to learn'] WHERE field_name IN ('contract_negotiations', 'career_development', 'media_relations', 'longterm_relationships', 'marketing_support', 'crisis_management', 'social_media_management');

-- Yes/No Options for managers
UPDATE profile_questions SET options = ARRAY['Yes, extensively', 'Yes, some experience', 'Limited experience', 'No experience but interested', 'No experience and not interested'] WHERE field_name IN ('financial_planning', 'international_experience');

-- Emergency Availability Options
UPDATE profile_questions SET options = ARRAY['24/7 availability', 'Business hours + emergencies', 'Business hours only', 'Limited availability', 'By appointment only'] WHERE field_name = 'emergency_availability';

-- Communication Approach Options
UPDATE profile_questions SET options = ARRAY['Daily check-ins', 'Weekly updates', 'Project-based communication', 'As-needed basis', 'Client preference', 'Formal scheduled meetings'] WHERE field_name = 'communication_approach';

-- Client Capacity Options
UPDATE profile_questions SET options = ARRAY['1-5 clients', '6-10 clients', '11-20 clients', '21-50 clients', '50+ clients', 'Depends on project size'] WHERE field_name = 'client_capacity';

-- ============================================
-- PRODUCER QUESTIONS (producer role)
-- ============================================

INSERT INTO profile_questions (talent_type, question, field_name, field_type, required, "order", active) VALUES
('profile', 'What is your primary production specialty?', 'production_specialty', 'select', true, 1, true),
('profile', 'How many years of production experience do you have?', 'production_experience_years', 'number', true, 2, true),
('profile', 'What types of projects do you typically produce?', 'production_types', 'checkbox', true, 3, true),
('profile', 'What is your typical project budget range?', 'production_budget_range', 'select', true, 4, true),
('profile', 'Are you comfortable with pre-production planning?', 'preproduction_comfort', 'select', true, 5, true),
('profile', 'Do you have experience with post-production supervision?', 'postproduction_experience', 'select', true, 6, true),
('profile', 'Are you comfortable with talent casting decisions?', 'casting_comfort', 'select', true, 7, true),
('profile', 'What is your experience with different crew sizes?', 'crew_size_experience', 'checkbox', true, 8, true),
('profile', 'Do you have experience with location scouting?', 'location_scouting', 'select', false, 9, true),
('profile', 'Are you comfortable with budget management?', 'budget_management', 'select', true, 10, true),
('profile', 'What is your experience with different shooting schedules?', 'schedule_experience', 'checkbox', true, 11, true),
('profile', 'Do you have experience with union productions?', 'union_experience', 'select', false, 12, true),
('profile', 'Are you comfortable with crisis management on set?', 'onset_crisis_management', 'select', true, 13, true),
('profile', 'What is your experience with different distribution channels?', 'distribution_experience', 'checkbox', false, 14, true),
('profile', 'Do you have experience with international co-productions?', 'international_coproduction', 'select', false, 15, true),
('profile', 'Are you comfortable with investor relations?', 'investor_relations', 'select', true, 16, true),
('profile', 'What is your experience with different genres?', 'genre_experience', 'checkbox', true, 17, true),
('profile', 'Do you have experience with digital/streaming platforms?', 'digital_platform_experience', 'select', false, 18, true),
('profile', 'Are you comfortable with multi-project management?', 'multiproject_management', 'select', true, 19, true),
('profile', 'What is your preferred production timeline?', 'production_timeline', 'select', true, 20, true);

-- Production Specialty Options
UPDATE profile_questions SET options = ARRAY['Executive Producer', 'Line Producer', 'Creative Producer', 'Associate Producer', 'Co-Producer', 'Independent Producer', 'Documentary Producer', 'Commercial Producer', 'Music Producer', 'Theater Producer'] WHERE field_name = 'production_specialty' AND talent_type = 'profile';

-- Production Types (checkbox)
UPDATE profile_questions SET options = ARRAY['Feature Films', 'Television Series', 'Documentaries', 'Commercials', 'Music Videos', 'Web Series', 'Short Films', 'Theater Productions', 'Live Events', 'Corporate Videos', 'Educational Content', 'Streaming Content'] WHERE field_name = 'production_types';

-- Production Budget Range Options
UPDATE profile_questions SET options = ARRAY['Micro budget (<$50K)', 'Low budget ($50K-$500K)', 'Medium budget ($500K-$5M)', 'High budget ($5M-$50M)', 'Major budget ($50M+)', 'Variable depending on project', 'Grant/non-profit funding'] WHERE field_name = 'production_budget_range';

-- Crew Size Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Small crew (1-10)', 'Medium crew (11-50)', 'Large crew (51-100)', 'Major crew (100+)', 'Variable crew sizes', 'Remote/distributed teams'] WHERE field_name = 'crew_size_experience';

-- Schedule Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Short shoots (1-5 days)', 'Medium shoots (1-4 weeks)', 'Long shoots (1-6 months)', 'Extended shoots (6+ months)', 'Intermittent shooting', 'Live/real-time production'] WHERE field_name = 'schedule_experience';

-- Distribution Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Theatrical release', 'Television broadcast', 'Streaming platforms', 'Digital distribution', 'Festival circuit', 'Direct-to-consumer', 'International distribution', 'Educational distribution'] WHERE field_name = 'distribution_experience';

-- Genre Experience (checkbox)
UPDATE profile_questions SET options = ARRAY['Drama', 'Comedy', 'Action/Adventure', 'Horror/Thriller', 'Science Fiction', 'Fantasy', 'Romance', 'Documentary', 'Musical', 'Animation', 'Family/Children', 'Historical/Period'] WHERE field_name = 'genre_experience';

-- Producer Comfort/Experience Options
UPDATE profile_questions SET options = ARRAY['Very comfortable/experienced', 'Comfortable/experienced', 'Some experience', 'Limited experience', 'No experience but willing to learn'] WHERE field_name IN ('preproduction_comfort', 'postproduction_experience', 'casting_comfort', 'budget_management', 'onset_crisis_management', 'investor_relations', 'multiproject_management');

-- Producer Yes/No Options
UPDATE profile_questions SET options = ARRAY['Extensive experience', 'Some experience', 'Limited experience', 'No experience but willing to learn', 'No experience and not interested'] WHERE field_name IN ('location_scouting', 'union_experience', 'international_coproduction', 'digital_platform_experience');

-- Production Timeline Options
UPDATE profile_questions SET options = ARRAY['Fast turnaround (weeks)', 'Standard timeline (months)', 'Extended development (years)', 'Depends on project', 'Flexible timeline', 'Deadline-driven'] WHERE field_name = 'production_timeline';

-- Update order for profile questions to distinguish between manager and producer
UPDATE profile_questions SET "order" = "order" + 100 WHERE talent_type = 'profile' AND field_name LIKE '%production%' OR field_name LIKE '%budget%' OR field_name LIKE '%crew%' OR field_name LIKE '%shooting%' OR field_name LIKE '%genre%' OR field_name LIKE '%distribution%' OR field_name LIKE '%investor%' OR field_name LIKE '%timeline%' OR field_name LIKE '%casting%' OR field_name LIKE '%location%' OR field_name LIKE '%union%' OR field_name LIKE '%onset%' OR field_name LIKE '%digital_platform%' OR field_name LIKE '%multiproject%' OR field_name LIKE '%international_coproduction%' OR field_name LIKE '%preproduction%' OR field_name LIKE '%postproduction%';