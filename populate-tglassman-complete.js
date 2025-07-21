import { db } from './server/db.js';
import { users, profiles, jobHistory, media, pricingTiers } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function populateTglassmanAccount() {
  try {
    console.log('🎬 Populating Tom Glassman account with comprehensive data...');

    // Find tglassman user
    const [user] = await db.select().from(users).where(eq(users.username, 'tglassman'));
    if (!user) {
      console.error('❌ User tglassman not found!');
      return;
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);

    // Update user with complete information
    await db.update(users)
      .set({
        firstName: 'Tom',
        lastName: 'Glassman',
        email: 'tom@tglassman.com',
        tierId: 10, // Enterprise Producer tier
        isVerified: true,
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
      })
      .where(eq(users.id, user.id));

    // Update or create comprehensive profile
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, user.id.toString()));
    
    const profileData = {
      userId: user.id.toString(),
      role: 'talent',
      talentType: 'actor',
      displayName: 'Tom Glassman',
      bio: 'Emmy-nominated actor with over 15 years of experience in film, television, and theater. Known for powerful dramatic performances and versatile character work. Recent Emmy nomination for Best Supporting Actor in "City of Dreams" (2024). Classically trained at Juilliard with extensive stage experience including Broadway productions.',
      location: 'Los Angeles, CA',
      website: 'https://tomglassman.com',
      phoneNumber: '+1 (555) 123-4567',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      heroImageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop',
      isVerified: true,
      isAvailable: true,
      completionPercentage: 100,
      rates: {
        hourly: 500,
        daily: 3500,
        project: 15000
      },
      skills: [
        'Method Acting',
        'Stage Combat',
        'Improvisation',
        'Voice Acting',
        'Dialects & Accents',
        'Musical Theater',
        'Classical Theater',
        'Film Acting',
        'Television',
        'Character Development'
      ],
      socialLinks: {
        instagram: 'https://instagram.com/tomglassman',
        twitter: 'https://twitter.com/tomglassman',
        linkedin: 'https://linkedin.com/in/tomglassman',
        website: 'https://tomglassman.com'
      }
    };

    if (existingProfile) {
      await db.update(profiles)
        .set(profileData)
        .where(eq(profiles.id, existingProfile.id));
      console.log('✅ Updated existing profile');
    } else {
      await db.insert(profiles).values(profileData);
      console.log('✅ Created new profile');
    }

    // Clear existing job history and media
    await db.delete(jobHistory).where(eq(jobHistory.userId, user.id));
    await db.delete(media).where(eq(media.userId, user.id));

    // Add comprehensive job history
    const jobHistoryData = [
      {
        userId: user.id,
        title: 'Lead Actor - Marcus Stone',
        company: 'HBO Productions',
        project: 'City of Dreams',
        role: 'Lead Actor',
        startDate: '2023-03-01',
        endDate: '2024-01-15',
        description: 'Emmy-nominated performance as Marcus Stone, a complex detective struggling with moral ambiguity in this critically acclaimed crime drama series.',
        skills: ['Drama', 'Character Development', 'Method Acting', 'Television'],
        isOngoing: false
      },
      {
        userId: user.id,
        title: 'Supporting Actor - James Morrison',
        company: 'Universal Pictures',
        project: 'The Last Stand',
        role: 'Supporting Actor',
        startDate: '2022-06-01',
        endDate: '2022-11-30',
        description: 'Supporting role in major motion picture, playing a war veteran with PTSD. Film grossed $85M worldwide.',
        skills: ['Film Acting', 'Drama', 'Stunts', 'Character Work'],
        isOngoing: false
      },
      {
        userId: user.id,
        title: 'Hamlet',
        company: 'Broadway Theater District',
        project: 'Hamlet Revival',
        role: 'Lead Actor',
        startDate: '2021-09-01',
        endDate: '2022-02-28',
        description: 'Critically acclaimed Broadway revival of Hamlet. Received Tony nomination for Best Actor in a Play.',
        skills: ['Classical Theater', 'Shakespeare', 'Stage Acting', 'Live Performance'],
        isOngoing: false
      },
      {
        userId: user.id,
        title: 'Recurring Role - Dr. Mitchell',
        company: 'Netflix',
        project: 'Medical Center',
        role: 'Recurring Actor',
        startDate: '2020-01-01',
        endDate: '2021-06-30',
        description: 'Recurring role across 18 episodes as head of cardiology. Character became fan favorite and was promoted to series regular.',
        skills: ['Television', 'Medical Drama', 'Character Development', 'Long-form Storytelling'],
        isOngoing: false
      },
      {
        userId: user.id,
        title: 'Voice Actor - Captain Steel',
        company: 'Disney Animation',
        project: 'Galaxy Heroes',
        role: 'Voice Actor',
        startDate: '2019-03-01',
        endDate: '2019-09-30',
        description: 'Lead voice role in animated feature film. Character required range from heroic to vulnerable moments.',
        skills: ['Voice Acting', 'Animation', 'Character Voice', 'Recording Studio Work'],
        isOngoing: false
      }
    ];

    for (const job of jobHistoryData) {
      await db.insert(jobHistory).values(job);
    }
    console.log('✅ Added comprehensive job history (5 entries)');

    // Add media portfolio
    const mediaData = [
      {
        userId: user.id,
        title: 'Professional Headshot',
        description: 'Primary professional headshot for casting submissions',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face',
        category: 'headshot',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Character Headshot - Dramatic',
        description: 'Dramatic character headshot for intense roles',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face',
        category: 'headshot',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'City of Dreams - Behind the Scenes',
        description: 'Behind the scenes footage from Emmy-nominated performance',
        url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=800&fit=crop',
        category: 'portfolio',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Broadway Hamlet Performance',
        description: 'Live performance capture from Tony-nominated Hamlet production',
        url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=1200&h=800&fit=crop',
        category: 'portfolio',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Film Set - The Last Stand',
        description: 'On-set photo from Universal Pictures production',
        url: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&h=800&fit=crop',
        category: 'portfolio',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Character Work - Dr. Mitchell',
        description: 'Character photo from Netflix Medical Center series',
        url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=800&fit=crop',
        category: 'portfolio',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Professional Portfolio Shots',
        description: 'Collection of professional portfolio photographs',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=800&fit=crop',
        category: 'portfolio',
        type: 'image',
        isPublic: true
      },
      {
        userId: user.id,
        title: 'Demo Reel 2024',
        description: 'Professional acting demo reel showcasing range and recent work',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'video',
        type: 'video',
        isPublic: true,
        externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];

    for (const mediaItem of mediaData) {
      await db.insert(media).values(mediaItem);
    }
    console.log('✅ Added comprehensive media portfolio (8 items)');

    console.log('🎉 Tom Glassman account fully populated with:');
    console.log('   - Complete profile information');
    console.log('   - 5 major professional job history entries');
    console.log('   - 8 professional media portfolio items');
    console.log('   - Verified status and Enterprise tier access');
    console.log('   - Professional headshots and portfolio images');
    console.log('   - Emmy and Tony nomination history');
    console.log('   - Contact information and social links');

  } catch (error) {
    console.error('❌ Error populating tglassman account:', error);
  }
}

populateTglassmanAccount();