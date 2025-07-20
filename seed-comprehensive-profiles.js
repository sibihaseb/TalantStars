// Comprehensive professional profiles for deployment readiness
import axios from 'axios';

const comprehensiveProfiles = [
  // FEATURED TALENTS (8 total)
  
  // 1. ACTOR - Leading Female
  {
    username: 'maya_thompson',
    password: 'talent123',
    email: 'maya.thompson@email.com',
    firstName: 'Maya',
    lastName: 'Thompson',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Maya Thompson',
      bio: 'Emmy-nominated actress known for her powerful dramatic performances in both film and television. Featured in "Midnight Stories" (Netflix) and "Broadway Dreams". Trained at Juilliard with extensive Shakespeare experience.',
      location: 'Los Angeles, CA',
      website: 'https://mayathompson.com',
      phoneNumber: '(555) 847-2891',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      height: '5\'7"',
      weight: '130 lbs',
      eyeColor: ['Hazel'],
      hairColor: ['Auburn'],
      unionStatus: ['SAG-AFTRA', 'AEA'],
      specialSkills: ['Shakespearean Acting', 'Fencing', 'French', 'Piano', 'Horseback Riding'],
      experience: '12 years',
      education: 'MFA Acting, The Juilliard School',
      credits: ['Netflix: Midnight Stories (Lead)', 'Broadway: Hamlet (Ophelia)', 'Film: The Last Summer (Supporting)'],
      awards: ['Emmy Nomination 2023', 'SAG Award Winner 2022', 'Drama Desk Award 2021']
    },
    jobHistory: [
      {
        title: 'Lead Role - Midnight Stories',
        company: 'Netflix',
        role: 'Lead Actress',
        startDate: '2022-03-01',
        endDate: '2023-11-15',
        description: 'Starring role in Netflix original series playing complex detective character across 3 seasons'
      },
      {
        title: 'Ophelia - Hamlet',
        company: 'Broadway Theatre',
        role: 'Featured Actress',
        startDate: '2021-09-01',
        endDate: '2022-01-30',
        description: 'Shakespeare revival on Broadway, received critical acclaim and drama desk nomination'
      }
    ]
  },

  // 2. ACTOR - Leading Male
  {
    username: 'james_carter',
    password: 'talent123',
    email: 'james.carter@email.com',
    firstName: 'James',
    lastName: 'Carter',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'James Carter',
      bio: 'Versatile actor with range from action blockbusters to intimate indie dramas. Known for "Titanfall" franchise and award-winning performance in "Quiet Moments". Method actor trained under Sanford Meisner technique.',
      location: 'New York, NY',
      website: 'https://jamescarter.com',
      phoneNumber: '(555) 234-8567',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      height: '6\'1"',
      weight: '185 lbs',
      eyeColor: ['Blue'],
      hairColor: ['Dark Brown'],
      unionStatus: ['SAG-AFTRA'],
      specialSkills: ['Stage Combat', 'Motorcycle Riding', 'Spanish', 'Guitar', 'Rock Climbing'],
      experience: '15 years',
      education: 'BFA Drama, New York University',
      credits: ['Titanfall Series (Lead)', 'Quiet Moments (Lead)', 'Marvel: Defenders (Supporting)'],
      awards: ['Golden Globe Nomination', 'Critics Choice Award', 'Independent Spirit Award']
    },
    jobHistory: [
      {
        title: 'Lead Hero - Titanfall 3',
        company: 'Universal Pictures',
        role: 'Lead Actor',
        startDate: '2023-01-15',
        endDate: '2023-09-30',
        description: 'Action blockbuster lead role, extensive stunt work and character development over 8-month shoot'
      }
    ]
  },

  // 3. MUSICIAN - Grammy Winner
  {
    username: 'luna_roswell',
    password: 'talent123',
    email: 'luna.roswell@email.com',
    firstName: 'Luna',
    lastName: 'Roswell',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Luna Roswell',
      bio: 'Grammy-winning singer-songwriter with ethereal vocals and introspective lyrics. 4 platinum albums, 250M+ streams worldwide. Known for blending indie folk with electronic elements creating a signature dreamy sound.',
      location: 'Nashville, TN',
      website: 'https://lunaroswell.com',
      phoneNumber: '(555) 765-4321',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      instruments: ['Vocals', 'Guitar', 'Piano', 'Synthesizer'],
      genres: ['Indie Folk', 'Dream Pop', 'Electronic'],
      experience: '10 years',
      education: 'Berklee College of Music',
      credits: ['4 Platinum Albums', 'Grammy Winner 2023', 'Coachella Headliner 2022'],
      awards: ['Grammy Award Best New Artist', 'American Music Award', 'iHeartRadio Award']
    },
    jobHistory: [
      {
        title: 'Headliner - Midnight Tour',
        company: 'Live Nation',
        role: 'Recording Artist',
        startDate: '2023-04-01',
        endDate: '2023-10-15',
        description: 'World tour across 45 cities, sold out venues including Madison Square Garden and Hollywood Bowl'
      }
    ]
  },

  // 4. MODEL - High Fashion
  {
    username: 'zara_divine',
    password: 'talent123',
    email: 'zara.divine@email.com',
    firstName: 'Zara',
    lastName: 'Divine',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      talentType: 'model',
      displayName: 'Zara Divine',
      bio: 'International supermodel with campaigns for Chanel, Dior, and Louis Vuitton. Cover model for Vogue, Harper\'s Bazaar, and Elle. Walked for Paris, Milan, and New York Fashion Weeks.',
      location: 'New York, NY',
      website: 'https://zaradivine.com',
      phoneNumber: '(555) 987-6543',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      height: '5\'10"',
      weight: '125 lbs',
      measurements: '34-24-35',
      shoeSize: '9',
      dressSize: '4',
      experience: '8 years',
      specialties: ['High Fashion', 'Editorial', 'Runway', 'Commercial'],
      credits: ['Chanel Campaign 2023', 'Vogue Cover Sept 2023', 'Paris Fashion Week 2023'],
      awards: ['Model of the Year 2022', 'Fashion Icon Award', 'Style Influencer Award']
    },
    jobHistory: [
      {
        title: 'Campaign Model - Chanel No.5',
        company: 'Chanel',
        role: 'Featured Model',
        startDate: '2023-02-01',
        endDate: '2023-05-30',
        description: 'Global fragrance campaign featured in print, digital, and television advertisements worldwide'
      }
    ]
  },

  // 5. VOICE ARTIST - Animation Expert
  {
    username: 'alex_storm',
    password: 'talent123',
    email: 'alex.storm@email.com',
    firstName: 'Alex',
    lastName: 'Storm',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      talentType: 'voice_artist',
      displayName: 'Alex Storm',
      bio: 'Award-winning voice actor known for iconic animated characters in Disney and Pixar films. Over 15 years voicing everything from heroic protagonists to memorable villains. Home studio with broadcast-quality equipment.',
      location: 'Los Angeles, CA',
      website: 'https://alexstorm.com',
      phoneNumber: '(555) 456-7890',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      voiceTypes: ['Character', 'Commercial', 'Animation', 'Video Game'],
      languages: ['English', 'Spanish', 'French'],
      experience: '15 years',
      equipment: ['Neumann U87', 'SSL Interface', 'Pro Tools HD'],
      credits: ['Disney: Hero Quest (Lead)', 'Pixar: Ocean Adventures (Supporting)', 'EA Games: Battle Legends'],
      awards: ['Voice Arts Award Winner', 'Annie Award Nomination', 'Behind the Voice Actors Award']
    },
    jobHistory: [
      {
        title: 'Lead Character Voice - Hero Quest',
        company: 'Disney Animation',
        role: 'Voice Actor',
        startDate: '2022-08-01',
        endDate: '2023-06-15',
        description: 'Lead character voice for major Disney animated feature, 200+ recording sessions over 10 months'
      }
    ]
  },

  // 6. PRODUCER - Film & TV
  {
    username: 'sarah_goldberg',
    password: 'talent123',
    email: 'sarah.goldberg@email.com',
    firstName: 'Sarah',
    lastName: 'Goldberg',
    role: 'producer',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'producer',
      displayName: 'Sarah Goldberg',
      bio: 'Emmy-winning executive producer with 20+ years developing premium content for Netflix, HBO, and major studios. Known for "Midnight Chronicles" and "City of Dreams". Expert in budget management and talent relations.',
      location: 'Los Angeles, CA',
      website: 'https://goldbergproductions.com',
      phoneNumber: '(555) 321-6547',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      specialties: ['Drama Series', 'Limited Series', 'Feature Films'],
      experience: '20 years',
      budgetRange: '$50M-$200M',
      credits: ['Midnight Chronicles (Exec Producer)', 'City of Dreams (Producer)', '15 Emmy Nominations'],
      awards: ['Emmy Award Winner', 'Producers Guild Award', 'Critics Choice Award']
    },
    jobHistory: [
      {
        title: 'Executive Producer - Midnight Chronicles',
        company: 'Netflix',
        role: 'Executive Producer',
        startDate: '2021-01-01',
        endDate: '2023-12-31',
        description: 'Oversaw production of 3-season drama series, managed $150M budget, Emmy-winning series'
      }
    ]
  },

  // 7. AGENT - Top Talent Rep
  {
    username: 'michael_sterling',
    password: 'talent123',
    email: 'michael.sterling@email.com',
    firstName: 'Michael',
    lastName: 'Sterling',
    role: 'agent',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'agent',
      displayName: 'Michael Sterling',
      bio: 'Senior partner at Sterling Talent Agency representing A-list actors, directors, and writers. 25+ years negotiating multi-million dollar deals. Clients include Oscar winners and franchise leads. Expert in contract negotiation.',
      location: 'Beverly Hills, CA',
      website: 'https://sterlingtalent.com',
      phoneNumber: '(555) 654-3210',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      specialties: ['A-List Talent', 'Film Packaging', 'TV Development'],
      experience: '25 years',
      clientTypes: ['Actors', 'Directors', 'Writers'],
      dealSize: '$1M-$50M',
      credits: ['100+ Major Film Deals', 'Oscar Winner Representation', 'Franchise Development'],
      achievements: ['Top Agent 2023', 'Deal Maker of the Year', 'Industry Leader Award']
    },
    jobHistory: [
      {
        title: 'Senior Partner',
        company: 'Sterling Talent Agency',
        role: 'Talent Agent',
        startDate: '2010-01-01',
        endDate: 'Present',
        description: 'Representing top-tier talent, negotiating major studio deals, developing talent careers'
      }
    ]
  },

  // 8. MANAGER - Music Industry
  {
    username: 'david_harrison',
    password: 'talent123',
    email: 'david.harrison@email.com',
    firstName: 'David',
    lastName: 'Harrison',
    role: 'manager',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'manager',
      displayName: 'David Harrison',
      bio: 'Grammy-winning artist manager with roster including platinum recording artists and Grammy winners. 18+ years building careers from emerging artists to global superstars. Expert in touring, recording, and brand partnerships.',
      location: 'Los Angeles, CA',
      website: 'https://harrisonmanagement.com',
      phoneNumber: '(555) 789-0123',
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      specialties: ['Recording Artists', 'Tour Management', 'Brand Partnerships'],
      experience: '18 years',
      clientTypes: ['Musicians', 'Producers', 'Songwriters'],
      achievements: ['Grammy Manager of Year', 'Platinum Album Success', 'World Tour Management'],
      credits: ['50+ Platinum Records', 'Grammy Winner Management', 'Billboard #1 Artists']
    },
    jobHistory: [
      {
        title: 'Artist Manager',
        company: 'Harrison Management',
        role: 'Music Manager',
        startDate: '2015-01-01',
        endDate: 'Present',
        description: 'Managing career development for platinum recording artists, tour coordination, label negotiations'
      }
    ]
  }
];

async function createComprehensiveProfiles() {
  console.log('Creating comprehensive professional profiles...');
  
  for (const profile of comprehensiveProfiles) {
    try {
      // Create user via API
      const userResponse = await axios.post('http://localhost:5000/api/auth/register', {
        username: profile.username,
        password: profile.password,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role,
        profileImageUrl: profile.profileImageUrl,
        acceptTerms: true,
        acceptPrivacy: true
      });
      
      console.log(`✅ Created user: ${profile.firstName} ${profile.lastName}`);
      
      // Login to get session
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: profile.username,
        password: profile.password
      });
      
      const sessionCookie = loginResponse.headers['set-cookie'];
      
      // Create profile via API
      if (profile.profile) {
        await axios.post('http://localhost:5000/api/user/profile', profile.profile, {
          headers: {
            'Cookie': sessionCookie
          }
        });
        console.log(`✅ Created profile for: ${profile.firstName} ${profile.lastName}`);
      }
      
      // Add job history if exists
      if (profile.jobHistory) {
        for (const job of profile.jobHistory) {
          await axios.post('http://localhost:5000/api/job-history', job, {
            headers: {
              'Cookie': sessionCookie
            }
          });
        }
        console.log(`✅ Added job history for: ${profile.firstName} ${profile.lastName}`);
      }
      
    } catch (error) {
      console.error(`❌ Error creating profile for ${profile.firstName} ${profile.lastName}:`, error.response?.data || error.message);
    }
  }
  
  console.log('🎉 Comprehensive profile creation completed!');
}

// Export for use
export { createComprehensiveProfiles, comprehensiveProfiles };

// Run if called directly
createComprehensiveProfiles().catch(console.error);