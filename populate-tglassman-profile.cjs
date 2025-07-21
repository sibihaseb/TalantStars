/**
 * Script to populate comprehensive profile data for tglassman user
 * This will create a complete, professional example profile
 */

const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function populateProfileData() {
  const client = await pool.connect();
  
  try {
    console.log('🎯 Starting comprehensive profile population for tglassman...');
    
    // First, let's find the tglassman user
    const userResult = await client.query('SELECT * FROM users WHERE username = $1', ['tglassman']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User tglassman not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Found user:', user.username, 'ID:', user.id);
    
    // Comprehensive profile data for Tom Glassman - Actor
    const profileData = {
      userId: user.id,
      role: 'talent',
      talentType: 'actor',
      displayName: 'Tom Glassman',
      firstName: 'Tom',
      lastName: 'Glassman',
      email: 'tom.glassman@email.com',
      phoneNumber: '+1 (555) 234-5678',
      location: 'Los Angeles, CA',
      website: 'www.tomglassmanactor.com',
      bio: 'Award-winning actor with over 15 years of experience in film, television, and theater. Known for powerful dramatic performances and versatile character work. Recent Emmy nomination for Best Supporting Actor in "City of Dreams" (2024). Classically trained at Juilliard with extensive stage experience including Broadway productions.',
      hourlyRate: 500,
      dailyRate: 4000,
      weeklyRate: 20000,
      availability: 'Available',
      // Skills and specialties
      skills: ['Method Acting', 'Stage Combat', 'Voice Acting', 'Improv', 'Character Development', 'Accent Work', 'Musical Theater', 'Shakespearean Theater'],
      specialties: ['Drama', 'Thriller', 'Independent Films', 'Character Acting', 'Stage Performance'],
      // Acting-specific details
      height: '6\'1"',
      weight: '175 lbs',
      eyeColor: 'Blue',
      hairColor: 'Dark Brown',
      unionStatus: 'SAG-AFTRA',
      representation: 'CAA (Talent Agency)',
      // Professional details
      yearsExperience: 15,
      education: 'MFA Acting - The Juilliard School, BA Theater Arts - UCLA',
      awards: 'Emmy Nomination - Best Supporting Actor (2024), Critics Choice Award - Best Ensemble Cast (2023), Tony Award Nomination - Best Actor in a Play (2019)',
      // Contact preferences
      preferredContactMethod: 'email',
      responseTime: '24 hours',
      languages: ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
      // Social links
      instagramUrl: 'https://instagram.com/tomglassmanactor',
      twitterUrl: 'https://twitter.com/tomglassman',
      linkedinUrl: 'https://linkedin.com/in/tomglassman',
      imdbUrl: 'https://imdb.com/name/nm1234567',
      // Additional fields
      timezone: 'PST',
      willingToTravel: true,
      hasPassport: true,
      driverLicense: true,
      smokingPolicy: 'Non-smoker',
      workPermit: 'US Citizen'
    };
    
    // Update user profile with comprehensive data
    const updateQuery = `
      UPDATE user_profiles SET 
        role = $2,
        talent_type = $3,
        display_name = $4,
        first_name = $5,
        last_name = $6,
        email = $7,
        phone_number = $8,
        location = $9,
        website = $10,
        bio = $11,
        hourly_rate = $12,
        daily_rate = $13,
        weekly_rate = $14,
        availability = $15,
        skills = $16,
        specialties = $17,
        years_experience = $18,
        education = $19,
        awards = $20,
        preferred_contact_method = $21,
        response_time = $22,
        languages = $23,
        instagram_url = $24,
        twitter_url = $25,
        linkedin_url = $26,
        timezone = $27,
        willing_to_travel = $28,
        has_passport = $29,
        driver_license = $30,
        work_permit = $31,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    
    await client.query(updateQuery, [
      user.id,
      profileData.role,
      profileData.talentType,
      profileData.displayName,
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phoneNumber,
      profileData.location,
      profileData.website,
      profileData.bio,
      profileData.hourlyRate,
      profileData.dailyRate,
      profileData.weeklyRate,
      profileData.availability,
      profileData.skills,
      profileData.specialties,
      profileData.yearsExperience,
      profileData.education,
      profileData.awards,
      profileData.preferredContactMethod,
      profileData.responseTime,
      profileData.languages,
      profileData.instagramUrl,
      profileData.twitterUrl,
      profileData.linkedinUrl,
      profileData.timezone,
      profileData.willingToTravel,
      profileData.hasPassport,
      profileData.driverLicense,
      profileData.workPermit
    ]);
    
    console.log('✅ Updated comprehensive profile data');
    
    // Add comprehensive job history for Tom Glassman
    const jobHistoryEntries = [
      {
        userId: user.id,
        projectTitle: 'City of Dreams',
        role: 'Supporting Actor - Detective Marcus Kane',
        company: 'HBO Max',
        startDate: '2023-03-01',
        endDate: '2024-02-15',
        description: 'Recurring role as a complex detective in acclaimed crime drama series. Emmy-nominated performance showcasing range from vulnerability to intensity.',
        achievements: 'Emmy nomination for Best Supporting Actor, 2.3M+ social media mentions',
        category: 'Television'
      },
      {
        userId: user.id,
        projectTitle: 'The Glass House',
        role: 'Lead Actor - James Morrison',
        company: 'A24 Films',
        startDate: '2022-08-10',
        endDate: '2022-12-20',
        description: 'Lead role in psychological thriller about a man questioning his reality. Demanding performance requiring extensive preparation and emotional range.',
        achievements: 'Sundance Film Festival Official Selection, Critics Choice Award - Best Ensemble Cast',
        category: 'Film'
      },
      {
        userId: user.id,
        projectTitle: 'Hamlet',
        role: 'Hamlet',
        company: 'Broadway Theater District',
        startDate: '2019-09-15',
        endDate: '2020-03-12',
        description: 'Title role in critically acclaimed Broadway revival of Shakespeare\'s Hamlet. 6-month run with sold-out performances.',
        achievements: 'Tony Award nomination for Best Actor in a Play, New York Times Critics\' Pick',
        category: 'Theater'
      },
      {
        userId: user.id,
        projectTitle: 'Midnight Protocol',
        role: 'Agent Thompson',
        company: 'Netflix',
        startDate: '2021-05-01',
        endDate: '2021-09-30',
        description: 'Supporting role in spy thriller series. Character development across 8 episodes, working closely with stunt coordinators for action sequences.',
        achievements: 'Series reached #1 on Netflix in 47 countries',
        category: 'Television'
      },
      {
        userId: user.id,
        projectTitle: 'The Merchant of Venice',
        role: 'Shylock',
        company: 'Shakespeare in the Park',
        startDate: '2020-07-01',
        endDate: '2020-08-30',
        description: 'Powerful portrayal of Shylock in outdoor summer production. Adaptation focused on contemporary relevance while maintaining classical integrity.',
        achievements: 'Standing ovations throughout run, Drama Desk Award consideration',
        category: 'Theater'
      }
    ];
    
    // Insert job history entries
    for (const entry of jobHistoryEntries) {
      await client.query(`
        INSERT INTO job_history (user_id, project_title, role, company, start_date, end_date, description, achievements, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (user_id, project_title, role) DO UPDATE SET
          company = EXCLUDED.company,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          description = EXCLUDED.description,
          achievements = EXCLUDED.achievements,
          category = EXCLUDED.category,
          updated_at = NOW()
      `, [
        entry.userId,
        entry.projectTitle,
        entry.role,
        entry.company,
        entry.startDate,
        entry.endDate,
        entry.description,
        entry.achievements,
        entry.category
      ]);
    }
    
    console.log('✅ Added comprehensive job history (5 entries)');
    
    // Set up profile sharing settings for public visibility
    const sharingSettings = {
      userId: user.id,
      customUrl: 'tglassman',
      isPublic: true,
      allowDirectMessages: true,
      showContactInfo: true,
      showSocialLinks: true,
      showMediaGallery: true,
      allowNonAccountHolders: true,
      completelyPrivate: false,
      shareableFields: ['bio', 'experience', 'skills', 'contact', 'rates'],
      profileViews: 247
    };
    
    await client.query(`
      INSERT INTO profile_sharing_settings (
        user_id, custom_url, is_public, allow_direct_messages, show_contact_info,
        show_social_links, show_media_gallery, allow_non_account_holders,
        completely_private, shareable_fields, profile_views, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        custom_url = EXCLUDED.custom_url,
        is_public = EXCLUDED.is_public,
        allow_direct_messages = EXCLUDED.allow_direct_messages,
        show_contact_info = EXCLUDED.show_contact_info,
        show_social_links = EXCLUDED.show_social_links,
        show_media_gallery = EXCLUDED.show_media_gallery,
        allow_non_account_holders = EXCLUDED.allow_non_account_holders,
        completely_private = EXCLUDED.completely_private,
        shareable_fields = EXCLUDED.shareable_fields,
        profile_views = EXCLUDED.profile_views,
        updated_at = NOW()
    `, [
      sharingSettings.userId,
      sharingSettings.customUrl,
      sharingSettings.isPublic,
      sharingSettings.allowDirectMessages,
      sharingSettings.showContactInfo,
      sharingSettings.showSocialLinks,
      sharingSettings.showMediaGallery,
      sharingSettings.allowNonAccountHolders,
      sharingSettings.completelyPrivate,
      sharingSettings.shareableFields,
      sharingSettings.profileViews
    ]);
    
    console.log('✅ Set up profile sharing settings');
    
    // Add some skill endorsements for credibility
    const skillEndorsements = [
      {
        endorsedUserId: user.id,
        endorserId: 'director.smith',
        skill: 'Method Acting',
        message: 'Tom\'s commitment to method acting brought incredible depth to his character. His preparation was extraordinary.'
      },
      {
        endorsedUserId: user.id,
        endorserId: 'casting.director.jones',
        skill: 'Character Development',
        message: 'Exceptional ability to develop complex characters. Tom brings nuance and authenticity to every role.'
      },
      {
        endorsedUserId: user.id,
        endorserId: 'broadway.producer',
        skill: 'Stage Combat',
        message: 'Highly skilled in stage combat. Professional, safe, and convincing in action sequences.'
      }
    ];
    
    for (const endorsement of skillEndorsements) {
      try {
        await client.query(`
          INSERT INTO skill_endorsements (endorsed_user_id, endorser_id, skill, message, created_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (endorsed_user_id, endorser_id, skill) DO NOTHING
        `, [
          endorsement.endorsedUserId,
          endorsement.endorserId,
          endorsement.skill,
          endorsement.message
        ]);
      } catch (error) {
        console.log('Note: Skill endorsements table may not exist, skipping...');
        break;
      }
    }
    
    console.log('✅ Added skill endorsements (if table exists)');
    
    console.log('\n🎉 COMPREHENSIVE PROFILE COMPLETE!');
    console.log('📊 Profile Summary:');
    console.log('   • Name: Tom Glassman');
    console.log('   • Role: Emmy-nominated Actor');
    console.log('   • Experience: 15+ years');
    console.log('   • Job History: 5 major projects');
    console.log('   • Skills: 8 specialized skills');
    console.log('   • Contact: Full contact information');
    console.log('   • Sharing: Public profile with custom URL');
    console.log('   • URL: /profile/tglassman');
    console.log('\n✨ Ready for demonstration!');
    
  } catch (error) {
    console.error('❌ Error populating profile:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateProfileData();