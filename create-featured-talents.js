// Script to create featured talent designations for the newly created profiles
import axios from 'axios';

const featuredDesignations = [
  // Maya Thompson - Actor
  {
    userId: 76, // Maya Thompson (first created user should be ID 76)
    categoryId: 1, // Actor category
    featuredTier: 'premium',
    displayOrder: 1,
    isActive: true
  },
  // James Carter - Actor  
  {
    userId: 77, // James Carter
    categoryId: 1, // Actor category
    featuredTier: 'premium',
    displayOrder: 2,
    isActive: true
  },
  // Luna Roswell - Musician
  {
    userId: 78, // Luna Roswell
    categoryId: 2, // Musician category
    featuredTier: 'premium',
    displayOrder: 3,
    isActive: true
  },
  // Zara Divine - Model
  {
    userId: 79, // Zara Divine
    categoryId: 3, // Model category
    featuredTier: 'premium',
    displayOrder: 4,
    isActive: true
  },
  // Alex Storm - Voice Artist
  {
    userId: 80, // Alex Storm
    categoryId: 4, // Voice Artist category
    featuredTier: 'premium',
    displayOrder: 5,
    isActive: true
  },
  // Sarah Goldberg - Producer
  {
    userId: 81, // Sarah Goldberg
    categoryId: 5, // Producer category
    featuredTier: 'premium',
    displayOrder: 6,
    isActive: true
  },
  // Michael Sterling - Agent
  {
    userId: 82, // Michael Sterling
    categoryId: 6, // Agent category
    featuredTier: 'premium',
    displayOrder: 7,
    isActive: true
  },
  // David Harrison - Manager
  {
    userId: 83, // David Harrison
    categoryId: 7, // Manager category
    featuredTier: 'premium',
    displayOrder: 8,
    isActive: true
  }
];

async function createFeaturedTalents() {
  console.log('Creating featured talent designations...');
  
  // First, let's get current users to match IDs
  try {
    const usersResponse = await axios.get('http://localhost:5000/api/users');
    console.log('Current users:', usersResponse.data.slice(-8)); // Show last 8 users
  } catch (error) {
    console.log('Could not fetch users, proceeding with estimated IDs...');
  }
  
  for (const featured of featuredDesignations) {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/featured-talents', featured);
      console.log(`✅ Created featured designation for user ID ${featured.userId}`);
    } catch (error) {
      console.error(`❌ Error creating featured designation for user ID ${featured.userId}:`, error.response?.data || error.message);
    }
  }
  
  console.log('🎉 Featured talent designations completed!');
}

// Run the script
createFeaturedTalents().catch(console.error);