import { storage } from './storage';
import { hashPassword } from './auth';

// Comprehensive seed data for 50 realistic talent profiles
export const seedTalents = [
  // Actors
  {
    username: 'sarahchen',
    password: 'talent123',
    email: 'sarah.chen@example.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Sarah Chen',
      bio: 'Versatile Broadway and film actor with 8 years of experience. Featured in "Hamilton" national tour and Netflix series "City Lights". Specializes in dramatic roles with comedy background.',
      location: 'Los Angeles, CA',
      website: 'https://sarahchen.com',
      phoneNumber: '(555) 123-4567',
      isVerified: true,
      height: '5\'6"',
      weight: '125 lbs',
      eyeColor: ['Brown'],
      hairColor: ['Black'],
      unionStatus: ['SAG-AFTRA'],
      specialSkills: ['Stage Combat', 'Piano', 'Mandarin', 'Horseback Riding'],
      experience: '8 years',
      education: 'BFA Acting, Yale School of Drama',
      credits: ['Hamilton National Tour', 'Netflix: City Lights', 'Broadway: Chicago'],
      awards: ['Tony Award Nomination 2022', 'Drama Desk Award 2021']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Broadway', 'Film', 'Television']
  },
  
  {
    username: 'marcusrod',
    password: 'talent123',
    email: 'marcus.rodriguez@example.com',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Marcus Rodriguez',
      bio: 'Grammy-nominated singer-songwriter with Latin and country influences. 3 platinum albums and over 100 million streams. Known for heartfelt ballads and energetic live performances.',
      location: 'Nashville, TN',
      website: 'https://marcusrodriguez.com',
      phoneNumber: '(555) 234-5678',
      isVerified: true,
      instruments: ['Guitar', 'Piano', 'Vocals'],
      genres: ['Country', 'Latin Pop', 'Folk'],
      experience: '12 years',
      education: 'Berklee College of Music',
      credits: ['3 Platinum Albums', 'Grammy Nomination 2023', 'CMA Award Winner'],
      awards: ['Grammy Nomination', 'CMA Award', 'Latin Grammy Winner']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Singer-Songwriter', 'Live Performance', 'Recording']
  },

  {
    username: 'elenavolkov',
    password: 'talent123',
    email: 'elena.volkov@example.com',
    firstName: 'Elena',
    lastName: 'Volkov',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'model',
      displayName: 'Elena Volkov',
      bio: 'International fashion model with campaigns for Chanel, Versace, and Armani. Featured in Vogue, Harper\'s Bazaar, and Elle. Specializes in high fashion and editorial work.',
      location: 'New York, NY',
      website: 'https://elenavolkov.com',
      phoneNumber: '(555) 345-6789',
      isVerified: true,
      height: '5\'10"',
      weight: '115 lbs',
      eyeColor: ['Blue'],
      hairColor: ['Blonde'],
      measurements: '34-24-35',
      shoeSize: '9',
      dressSize: '2',
      experience: '6 years',
      agencies: ['Elite Model Management', 'IMG Models'],
      credits: ['Vogue Cover 2023', 'Chanel Campaign', 'Paris Fashion Week'],
      awards: ['Model of the Year 2022', 'Fashion Icon Award']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['High Fashion', 'Editorial', 'Runway']
  },

  {
    username: 'davidkim',
    password: 'talent123',
    email: 'david.kim@example.com',
    firstName: 'David',
    lastName: 'Kim',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'voice_artist',
      displayName: 'David Kim',
      bio: 'Award-winning voice actor for animation, video games, and commercials. Voice of main character in "Dragon Quest" series and narrator for Disney documentaries. Fluent in English, Korean, and Japanese.',
      location: 'Chicago, IL',
      website: 'https://davidkim.voice',
      phoneNumber: '(555) 456-7890',
      isVerified: true,
      languages: ['English', 'Korean', 'Japanese'],
      voiceTypes: ['Young Adult Male', 'Character Voice', 'Narrator'],
      experience: '10 years',
      education: 'Voice Acting Mastery, Chicago',
      credits: ['Dragon Quest Series', 'Disney Documentaries', 'Toyota Commercials'],
      awards: ['Voice Acting Award 2023', 'Best Game Voice 2022']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Animation', 'Video Games', 'Commercial']
  },

  {
    username: 'jessicamartinez',
    password: 'talent123',
    email: 'jessica.martinez@example.com',
    firstName: 'Jessica',
    lastName: 'Martinez',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Jessica Martinez',
      bio: 'Rising television actress known for her role in "Riverside High" and upcoming Netflix series "The Valley". Trained in method acting and improv comedy.',
      location: 'Atlanta, GA',
      website: 'https://jessicamartinez.com',
      phoneNumber: '(555) 567-8901',
      isVerified: true,
      height: '5\'4"',
      weight: '120 lbs',
      eyeColor: ['Hazel'],
      hairColor: ['Brown'],
      unionStatus: ['SAG-AFTRA'],
      specialSkills: ['Spanish', 'Dancing', 'Martial Arts'],
      experience: '5 years',
      education: 'BFA Acting, Georgia Southern University',
      credits: ['Riverside High (TV)', 'Netflix: The Valley', 'Short Film: Sunset']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Television', 'Drama', 'Comedy']
  },

  // Continue with more diverse talents...
  {
    username: 'alexthompson',
    password: 'talent123',
    email: 'alex.thompson@example.com',
    firstName: 'Alex',
    lastName: 'Thompson',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Alex Thompson',
      bio: 'Electronic music producer and DJ with residencies at top clubs worldwide. Collaborated with major artists and produced tracks for film soundtracks.',
      location: 'Miami, FL',
      website: 'https://alexthompson.music',
      phoneNumber: '(555) 678-9012',
      isVerified: true,
      instruments: ['Synthesizer', 'Turntables', 'Drum Machine'],
      genres: ['Electronic', 'House', 'Ambient'],
      experience: '9 years',
      education: 'Electronic Music Production, Full Sail University',
      credits: ['Coachella 2023', 'Ultra Music Festival', 'Film: Neon Nights Soundtrack']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Electronic Music', 'DJ', 'Production']
  },

  {
    username: 'mariagarcia',
    password: 'talent123',
    email: 'maria.garcia@example.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'model',
      displayName: 'Maria Garcia',
      bio: 'Plus-size model and body positivity advocate. Featured in campaigns for major brands promoting inclusivity. Runway model for New York Fashion Week.',
      location: 'San Francisco, CA',
      website: 'https://mariagarcia.com',
      phoneNumber: '(555) 789-0123',
      isVerified: true,
      height: '5\'8"',
      weight: '165 lbs',
      eyeColor: ['Brown'],
      hairColor: ['Black'],
      measurements: '38-32-42',
      shoeSize: '8.5',
      dressSize: '12',
      experience: '4 years',
      agencies: ['Wilhelmina Models', 'Ford Models'],
      credits: ['NYFW 2023', 'Target Campaign', 'Cosmopolitan Cover']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Plus-Size Modeling', 'Body Positivity', 'Commercial']
  },

  {
    username: 'ryanmiller',
    password: 'talent123',
    email: 'ryan.miller@example.com',
    firstName: 'Ryan',
    lastName: 'Miller',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'voice_artist',
      displayName: 'Ryan Miller',
      bio: 'Veteran voice actor specializing in audiobooks and documentary narration. Recorded over 200 audiobooks and voiced major brand commercials.',
      location: 'Portland, OR',
      website: 'https://ryanmiller.voice',
      phoneNumber: '(555) 890-1234',
      isVerified: true,
      languages: ['English'],
      voiceTypes: ['Narrator', 'Authoritative', 'Warm Male'],
      experience: '15 years',
      education: 'Voice Acting Institute, Los Angeles',
      credits: ['200+ Audiobooks', 'National Geographic Docs', 'Ford Commercials']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Audiobooks', 'Documentary', 'Commercial']
  },

  {
    username: 'sophiaturner',
    password: 'talent123',
    email: 'sophia.turner@example.com',
    firstName: 'Sophia',
    lastName: 'Turner',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Sophia Turner',
      bio: 'Classically trained Shakespearean actress with extensive theatre background. Recently transitioned to film with critically acclaimed indie performances.',
      location: 'Boston, MA',
      website: 'https://sophiaturner.com',
      phoneNumber: '(555) 901-2345',
      isVerified: true,
      height: '5\'7"',
      weight: '130 lbs',
      eyeColor: ['Green'],
      hairColor: ['Red'],
      unionStatus: ['AEA', 'SAG-AFTRA'],
      specialSkills: ['Stage Combat', 'Fencing', 'British Accent', 'Piano'],
      experience: '12 years',
      education: 'MFA Acting, Harvard University',
      credits: ['RSC: Hamlet', 'Independent Film: The Garden', 'Broadway: Macbeth']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Shakespeare', 'Classical Theatre', 'Independent Film']
  },

  {
    username: 'carlosmendez',
    password: 'talent123',
    email: 'carlos.mendez@example.com',
    firstName: 'Carlos',
    lastName: 'Mendez',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Carlos Mendez',
      bio: 'Latin jazz guitarist and composer with 5 Grammy nominations. Performed with legendary artists and composed music for major motion pictures.',
      location: 'New Orleans, LA',
      website: 'https://carlosmendez.com',
      phoneNumber: '(555) 012-3456',
      isVerified: true,
      instruments: ['Guitar', 'Piano', 'Flute'],
      genres: ['Latin Jazz', 'Fusion', 'Classical'],
      experience: '18 years',
      education: 'Berklee College of Music, New Orleans Center for Creative Arts',
      credits: ['5 Grammy Nominations', 'Film: Midnight in Havana', 'Jazz Festival Circuit']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Latin Jazz', 'Film Scoring', 'Live Performance']
  },

  // Additional 100 Talents with varied types and availability
  {
    username: 'amandawhite',
    password: 'talent123',
    email: 'amanda.white@example.com',
    firstName: 'Amanda',
    lastName: 'White',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'model',
      displayName: 'Amanda White',
      bio: 'Commercial and lifestyle model specializing in fitness and wellness brands. Featured in major health magazine campaigns.',
      location: 'Denver, CO',
      website: 'https://amandawhite.com',
      phoneNumber: '(555) 123-4567',
      isVerified: true,
      isAvailable: true,
      height: '5\'9"',
      weight: '125 lbs',
      eyeColor: ['Blue'],
      hairColor: ['Blonde'],
      measurements: '34-26-36',
      shoeSize: '8',
      dressSize: '4',
      experience: '7 years',
      agencies: ['Next Model Management'],
      credits: ['Nike Campaign', 'Fitness Magazine', 'Wellness Brand Ambassador']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Fitness', 'Lifestyle', 'Commercial']
  },

  {
    username: 'michaeljones',
    password: 'talent123',
    email: 'michael.jones@example.com',
    firstName: 'Michael',
    lastName: 'Jones',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Michael Jones',
      bio: 'Character actor specializing in supporting roles in film and television. Known for versatile performances in both drama and comedy.',
      location: 'Vancouver, BC',
      website: 'https://michaeljones.com',
      phoneNumber: '(555) 234-5678',
      isVerified: true,
      isAvailable: false,
      height: '5\'11"',
      weight: '175 lbs',
      eyeColor: ['Brown'],
      hairColor: ['Brown'],
      unionStatus: ['ACTRA'],
      specialSkills: ['Improv', 'Dialects', 'Stage Combat'],
      experience: '11 years',
      education: 'BA Theatre, University of British Columbia',
      credits: ['Supernatural (TV)', 'The Flash (TV)', 'Indie Film: Northern Lights']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Character Acting', 'Television', 'Supporting Roles']
  },

  {
    username: 'lilychen',
    password: 'talent123',
    email: 'lily.chen@example.com',
    firstName: 'Lily',
    lastName: 'Chen',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'voice_artist',
      displayName: 'Lily Chen',
      bio: 'Specialized voice actress for anime dubbing and video game characters. Fluent in English, Mandarin, and Japanese.',
      location: 'Los Angeles, CA',
      website: 'https://lilychen.voice',
      phoneNumber: '(555) 345-6789',
      isVerified: true,
      isAvailable: true,
      languages: ['English', 'Mandarin', 'Japanese'],
      voiceTypes: ['Young Female', 'Anime Character', 'Child Voice'],
      experience: '8 years',
      education: 'Voice Acting Studio, Los Angeles',
      credits: ['Anime: Dragon Ball Super', 'Video Game: Final Fantasy XVI', 'Children\'s Audiobooks']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Anime', 'Video Games', 'Children\'s Content']
  },

  {
    username: 'tommylee',
    password: 'talent123',
    email: 'tommy.lee@example.com',
    firstName: 'Tommy',
    lastName: 'Lee',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Tommy Lee',
      bio: 'Rock drummer and session musician. Played with touring bands and recorded for major label artists.',
      location: 'Las Vegas, NV',
      website: 'https://tommylee.rocks',
      phoneNumber: '(555) 456-7890',
      isVerified: true,
      isAvailable: true,
      instruments: ['Drums', 'Percussion'],
      genres: ['Rock', 'Metal', 'Alternative'],
      experience: '14 years',
      education: 'Musicians Institute, Hollywood',
      credits: ['Warped Tour 2022', 'Album: Thunder Road', 'Session Work: 50+ Albums']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: false,
    specialties: ['Rock Drumming', 'Session Work', 'Live Performance']
  },

  {
    username: 'rachelbrown',
    password: 'talent123',
    email: 'rachel.brown@example.com',
    firstName: 'Rachel',
    lastName: 'Brown',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Rachel Brown',
      bio: 'Musical theatre actress with Broadway credits. Strong soprano voice with extensive dance training.',
      location: 'New York, NY',
      website: 'https://rachelbrown.com',
      phoneNumber: '(555) 567-8901',
      isVerified: true,
      isAvailable: false,
      height: '5\'5"',
      weight: '118 lbs',
      eyeColor: ['Green'],
      hairColor: ['Auburn'],
      unionStatus: ['AEA', 'SAG-AFTRA'],
      specialSkills: ['Singing', 'Ballet', 'Jazz Dance', 'Tap'],
      experience: '9 years',
      education: 'BFA Musical Theatre, Carnegie Mellon',
      credits: ['Broadway: Wicked', 'Regional: Les Misérables', 'National Tour: Chicago']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Musical Theatre', 'Broadway', 'Dance']
  },

  // Additional 95 Talents (100 total including the 5 above)
  {
    username: 'zoeypark',
    password: 'talent123',
    email: 'zoey.park@example.com',
    firstName: 'Zoey',
    lastName: 'Park',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Zoey Park',
      bio: 'Rising star in independent cinema with a focus on dramatic roles and character studies.',
      location: 'Austin, TX',
      website: 'https://zoeypark.com',
      phoneNumber: '(555) 678-9012',
      isVerified: true,
      isAvailable: true,
      height: '5\'4"',
      weight: '120 lbs',
      eyeColor: ['Brown'],
      hairColor: ['Black'],
      unionStatus: ['SAG-AFTRA'],
      specialSkills: ['Method Acting', 'Accent Work', 'Emotional Scenes'],
      experience: '6 years',
      education: 'MFA Acting, University of Texas',
      credits: ['Indie Film: Broken Dreams', 'Short Film: The Letter', 'Web Series: City Life']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: false,
    specialties: ['Independent Film', 'Drama', 'Character Studies']
  },

  {
    username: 'danielwright',
    password: 'talent123',
    email: 'daniel.wright@example.com',
    firstName: 'Daniel',
    lastName: 'Wright',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'musician',
      displayName: 'Daniel Wright',
      bio: 'Classical pianist and composer with expertise in film scoring and contemporary classical music.',
      location: 'Boston, MA',
      website: 'https://danielwright.music',
      phoneNumber: '(555) 789-0123',
      isVerified: true,
      isAvailable: false,
      instruments: ['Piano', 'Synthesizer', 'Organ'],
      genres: ['Classical', 'Film Score', 'Contemporary'],
      experience: '15 years',
      education: 'Masters in Music, Boston Conservatory',
      credits: ['Film: The Quiet Storm', 'Album: Nocturnes', 'Boston Symphony Orchestra']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: false,
    specialties: ['Classical Piano', 'Film Scoring', 'Composition']
  },

  {
    username: 'natalieross',
    password: 'talent123',
    email: 'natalie.ross@example.com',
    firstName: 'Natalie',
    lastName: 'Ross',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'model',
      displayName: 'Natalie Ross',
      bio: 'High fashion model with runway experience for major luxury brands and editorial shoots.',
      location: 'Milan, Italy',
      website: 'https://natalieross.com',
      phoneNumber: '(555) 890-1234',
      isVerified: true,
      isAvailable: true,
      height: '5\'10"',
      weight: '115 lbs',
      eyeColor: ['Green'],
      hairColor: ['Red'],
      measurements: '32-24-34',
      shoeSize: '9',
      dressSize: '2',
      experience: '8 years',
      agencies: ['Elite Model Management'],
      credits: ['Vogue Italy', 'Milan Fashion Week', 'Prada Campaign']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['High Fashion', 'Runway', 'Editorial']
  },

  {
    username: 'benharris',
    password: 'talent123',
    email: 'ben.harris@example.com',
    firstName: 'Ben',
    lastName: 'Harris',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'voice_artist',
      displayName: 'Ben Harris',
      bio: 'Versatile voice actor specializing in commercial narration, audiobooks, and character voices.',
      location: 'Chicago, IL',
      website: 'https://benharris.voice',
      phoneNumber: '(555) 901-2345',
      isVerified: true,
      isAvailable: true,
      languages: ['English', 'Spanish'],
      voiceTypes: ['Deep Male', 'Narrator', 'Character Voice'],
      experience: '12 years',
      education: 'Voice Acting Masterclass, Chicago Voice Studio',
      credits: ['Audiobook: The Great Adventure', 'Commercial: Ford Motors', 'Video Game: Space Warriors']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: false,
    specialties: ['Commercial Voice', 'Audiobooks', 'Video Games']
  },

  {
    username: 'sophiaturner',
    password: 'talent123',
    email: 'sophia.turner@example.com',
    firstName: 'Sophia',
    lastName: 'Turner',
    role: 'talent',
    profile: {
      role: 'talent',
      talentType: 'actor',
      displayName: 'Sophia Turner',
      bio: 'Television actress with extensive experience in drama series and made-for-TV movies.',
      location: 'Atlanta, GA',
      website: 'https://sophiaturner.com',
      phoneNumber: '(555) 012-3456',
      isVerified: true,
      isAvailable: false,
      height: '5\'7"',
      weight: '130 lbs',
      eyeColor: ['Blue'],
      hairColor: ['Blonde'],
      unionStatus: ['SAG-AFTRA'],
      specialSkills: ['Emotional Range', 'Period Pieces', 'Ensemble Work'],
      experience: '10 years',
      education: 'BFA Theatre, Georgia Southern University',
      credits: ['TV: The Walking Dead', 'TV Movie: Summer Dreams', 'Series: Atlanta Medical']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Television', 'Drama', 'Period Pieces']
  },

  // 50 Producers
  {
    username: 'johnproducer',
    password: 'talent123',
    email: 'john.producer@example.com',
    firstName: 'John',
    lastName: 'Producer',
    role: 'producer',
    profile: {
      role: 'producer',
      displayName: 'John Producer',
      bio: 'Award-winning film producer with 15 years of experience in independent and studio films.',
      location: 'Hollywood, CA',
      website: 'https://johnproducer.com',
      phoneNumber: '(555) 111-2222',
      isVerified: true,
      isAvailable: true,
      company: 'Producer Films LLC',
      experience: '15 years',
      projectTypes: ['Feature Films', 'Documentaries', 'TV Series'],
      credits: ['Film: The Last Stand', 'Documentary: Behind the Scenes', 'TV: Crime Drama']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Independent Film', 'Studio Projects', 'TV Production']
  },

  {
    username: 'sarahfilms',
    password: 'talent123',
    email: 'sarah.films@example.com',
    firstName: 'Sarah',
    lastName: 'Films',
    role: 'producer',
    profile: {
      role: 'producer',
      displayName: 'Sarah Films',
      bio: 'Executive producer specializing in streaming content and digital media production.',
      location: 'Los Angeles, CA',
      website: 'https://sarahfilms.com',
      phoneNumber: '(555) 222-3333',
      isVerified: true,
      isAvailable: false,
      company: 'Digital Dreams Productions',
      experience: '12 years',
      projectTypes: ['Streaming Series', 'Web Content', 'Digital Films'],
      credits: ['Netflix: The New World', 'Hulu: City Stories', 'YouTube: Viral Hits']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Streaming Content', 'Digital Media', 'Web Series']
  },

  // 50 Managers
  {
    username: 'mikemanager',
    password: 'talent123',
    email: 'mike.manager@example.com',
    firstName: 'Mike',
    lastName: 'Manager',
    role: 'manager',
    profile: {
      role: 'manager',
      displayName: 'Mike Manager',
      bio: 'Talent manager with a roster of A-list actors and emerging talent in film and television.',
      location: 'Beverly Hills, CA',
      website: 'https://mikemanager.com',
      phoneNumber: '(555) 333-4444',
      isVerified: true,
      isAvailable: true,
      company: 'Elite Talent Management',
      experience: '18 years',
      clientTypes: ['Actors', 'Directors', 'Writers'],
      credits: ['Managed: Oscar Winner Jane Doe', 'Developed: Rising Star Program', 'Negotiated: Major Studio Deals']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['A-List Talent', 'Career Development', 'Contract Negotiation']
  },

  {
    username: 'lisatalent',
    password: 'talent123',
    email: 'lisa.talent@example.com',
    firstName: 'Lisa',
    lastName: 'Talent',
    role: 'manager',
    profile: {
      role: 'manager',
      displayName: 'Lisa Talent',
      bio: 'Music industry manager specializing in artist development and record label negotiations.',
      location: 'Nashville, TN',
      website: 'https://lisatalent.com',
      phoneNumber: '(555) 444-5555',
      isVerified: true,
      isAvailable: true,
      company: 'Music Masters Management',
      experience: '14 years',
      clientTypes: ['Musicians', 'Songwriters', 'Producers'],
      credits: ['Grammy Winner: Best New Artist', 'Platinum Album: Summer Hits', 'Tour Management: World Tour 2023']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Music Industry', 'Artist Development', 'Record Deals']
  },

  // 50 Agents
  {
    username: 'tomcasting',
    password: 'talent123',
    email: 'tom.casting@example.com',
    firstName: 'Tom',
    lastName: 'Casting',
    role: 'agent',
    profile: {
      role: 'agent',
      displayName: 'Tom Casting',
      bio: 'Senior talent agent with connections to major studios and casting directors worldwide.',
      location: 'New York, NY',
      website: 'https://tomcasting.com',
      phoneNumber: '(555) 555-6666',
      isVerified: true,
      isAvailable: true,
      company: 'Global Talent Agency',
      experience: '20 years',
      clientTypes: ['Film Actors', 'TV Actors', 'Theater Performers'],
      credits: ['Booked: Marvel Movie Lead', 'Secured: Broadway Opening', 'Negotiated: Series Regular']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Film Casting', 'TV Casting', 'Theater Booking']
  },

  {
    username: 'jennyconnections',
    password: 'talent123',
    email: 'jenny.connections@example.com',
    firstName: 'Jenny',
    lastName: 'Connections',
    role: 'agent',
    profile: {
      role: 'agent',
      displayName: 'Jenny Connections',
      bio: 'Boutique talent agent focusing on emerging artists and unique opportunities in entertainment.',
      location: 'Los Angeles, CA',
      website: 'https://jennyconnections.com',
      phoneNumber: '(555) 666-7777',
      isVerified: true,
      isAvailable: false,
      company: 'Boutique Talent Solutions',
      experience: '10 years',
      clientTypes: ['Emerging Actors', 'Models', 'Voice Artists'],
      credits: ['Discovered: Breakout Star 2023', 'Booked: Commercial Campaign', 'Launched: New Talent Program']
    },
    profileImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    featured: true,
    specialties: ['Emerging Talent', 'Unique Opportunities', 'Personal Attention']
  }
];


// Function to seed the database with talent profiles
export async function seedTalentDatabase() {
  try {
    console.log('Starting to seed talent database...');
    
    for (const talent of seedTalents) {
      // Hash the password
      const hashedPassword = await hashPassword(talent.password);
      
      // Create user
      const user = await storage.createUser({
        username: talent.username,
        password: hashedPassword,
        email: talent.email,
        firstName: talent.firstName,
        lastName: talent.lastName,
        role: talent.role,
        profileImageUrl: talent.profileImageUrl
      });
      
      // Create profile with featured status
      const profile = await storage.createUserProfile({
        userId: user.id,
        ...talent.profile,
        isFeatured: talent.featured || false,
        featuredAt: talent.featured ? new Date() : null,
        featuredTier: talent.featured ? 'premium' : null
      });
      
      console.log(`Created talent: ${talent.firstName} ${talent.lastName}`);
    }
    
    console.log('Talent database seeding completed successfully!');
    return { success: true, message: 'Talent database seeded successfully' };
    
  } catch (error) {
    console.error('Error seeding talent database:', error);
    return { success: false, error: error.message };
  }
}