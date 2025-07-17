import { storage } from './server/storage.js';

// Hash function (simple version for seeding)
function simpleHash(password) {
  return password + '_hashed';
}

// Sample featured talents data
const featuredTalents = [
  {
    username: 'emma_star',
    password: simpleHash('password123'),
    email: 'emma@example.com',
    firstName: 'Emma',
    lastName: 'Star',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      displayName: 'Emma Star',
      bio: 'Professional actress with extensive theater and film experience.',
      location: 'Los Angeles, CA',
      talentType: 'actor',
      isVerified: true,
      isAvailable: true,
      availabilityStatus: 'available',
      isFeatured: true,
      featuredAt: new Date(),
      featuredTier: 'premium'
    }
  },
  {
    username: 'mike_voice',
    password: simpleHash('password123'),
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Voice',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      displayName: 'Mike Voice',
      bio: 'Award-winning voice actor for animation and commercials.',
      location: 'New York, NY',
      talentType: 'voice_artist',
      isVerified: true,
      isAvailable: true,
      availabilityStatus: 'available',
      isFeatured: true,
      featuredAt: new Date(),
      featuredTier: 'premium'
    }
  },
  {
    username: 'sarah_model',
    password: simpleHash('password123'),
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Model',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      displayName: 'Sarah Model',
      bio: 'Fashion and commercial model with international experience.',
      location: 'Miami, FL',
      talentType: 'model',
      isVerified: true,
      isAvailable: true,
      availabilityStatus: 'available',
      isFeatured: true,
      featuredAt: new Date(),
      featuredTier: 'premium'
    }
  },
  {
    username: 'jazz_musician',
    password: simpleHash('password123'),
    email: 'jazz@example.com',
    firstName: 'Jazz',
    lastName: 'Musician',
    role: 'talent',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    profile: {
      role: 'talent',
      displayName: 'Jazz Musician',
      bio: 'Professional jazz pianist and composer.',
      location: 'New Orleans, LA',
      talentType: 'musician',
      isVerified: true,
      isAvailable: true,
      availabilityStatus: 'available',
      isFeatured: true,
      featuredAt: new Date(),
      featuredTier: 'premium'
    }
  }
];

// Seed function
async function seedFeaturedTalents() {
  try {
    console.log('Starting to seed featured talents...');
    
    for (const talent of featuredTalents) {
      // Create user
      const user = await storage.upsertUser({
        username: talent.username,
        password: talent.password,
        email: talent.email,
        firstName: talent.firstName,
        lastName: talent.lastName,
        role: talent.role,
        profileImageUrl: talent.profileImageUrl
      });
      
      // Create profile
      const profile = await storage.createUserProfile({
        userId: user.id,
        ...talent.profile
      });
      
      console.log(`Created featured talent: ${talent.firstName} ${talent.lastName}`);
    }
    
    console.log('Featured talents seeded successfully!');
  } catch (error) {
    console.error('Error seeding featured talents:', error);
  }
}

// Run the seeding
seedFeaturedTalents();