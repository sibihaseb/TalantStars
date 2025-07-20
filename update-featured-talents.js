// Script to replace existing featured talents with our new comprehensive profiles
import axios from 'axios';

async function updateFeaturedTalents() {
  console.log('Updating featured talents with new comprehensive profiles...');
  
  try {
    // Get current featured talents
    const featuredResponse = await axios.get('http://localhost:5000/api/featured-talents');
    const currentFeatured = featuredResponse.data;
    console.log(`Found ${currentFeatured.length} current featured talents`);
    
    // Get all users to find our new ones - the users endpoint returns an array directly
    let allUsers = [];
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users');
      allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : [];
    } catch (error) {
      console.log('Could not fetch users, proceeding with manual user IDs...');
      allUsers = [];
    }
    
    // Find our new professional profiles - if we can't get users, use known IDs
    let newProfessionals = [];
    if (allUsers.length > 0) {
      newProfessionals = allUsers.filter(user => 
        ['maya_thompson', 'james_carter', 'luna_roswell', 'zara_divine', 'alex_storm', 'sarah_goldberg', 'michael_sterling', 'david_harrison'].includes(user.username)
      );
      console.log('Found new professional profiles:', newProfessionals.map(u => `${u.firstName} ${u.lastName} (ID: ${u.id})`));
    } else {
      // Use estimated user IDs based on creation order
      const estimatedUsers = [
        { id: 76, username: 'maya_thompson', firstName: 'Maya', lastName: 'Thompson' },
        { id: 77, username: 'james_carter', firstName: 'James', lastName: 'Carter' },
        { id: 78, username: 'luna_roswell', firstName: 'Luna', lastName: 'Roswell' },
        { id: 79, username: 'zara_divine', firstName: 'Zara', lastName: 'Divine' },
        { id: 80, username: 'alex_storm', firstName: 'Alex', lastName: 'Storm' },
        { id: 81, username: 'sarah_goldberg', firstName: 'Sarah', lastName: 'Goldberg' },
        { id: 82, username: 'michael_sterling', firstName: 'Michael', lastName: 'Sterling' },
        { id: 83, username: 'david_harrison', firstName: 'David', lastName: 'Harrison' }
      ];
      newProfessionals = estimatedUsers;
      console.log('Using estimated user IDs for new professionals');
    }
    
    // Replace problematic featured talents
    const problematicIds = currentFeatured.filter(ft => 
      !ft.user.firstName || ft.user.firstName === 'undefined' || 
      !ft.user.profileImageUrl || ft.user.firstName === 'pdf' || ft.user.firstName === 'Tom'
    ).map(ft => ft.id);
    
    console.log('Problematic featured talent IDs to replace:', problematicIds);
    
    // Delete problematic featured talents
    for (const ftId of problematicIds) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/featured-talents/${ftId}`);
        console.log(`✅ Deleted problematic featured talent ID ${ftId}`);
      } catch (error) {
        console.error(`❌ Error deleting featured talent ${ftId}:`, error.response?.data || error.message);
      }
    }
    
    // Add our new professional profiles as featured
    const categoryMap = {
      'maya_thompson': 1,   // Featured Performer
      'james_carter': 1,    // Featured Performer  
      'luna_roswell': 2,    // Rising Star
      'zara_divine': 4,     // Breakthrough Artist
      'alex_storm': 3,      // Industry Expert
      'sarah_goldberg': 5,  // Award Winner
      'michael_sterling': 1, // Featured Performer
      'david_harrison': 2   // Rising Star
    };
    
    let displayOrder = 1;
    for (const user of newProfessionals) {
      const newFeatured = {
        userId: user.id,
        categoryId: categoryMap[user.username] || 1,
        featuredReason: `Professional excellence and industry recognition`,
        displayOrder: displayOrder++,
        isActive: true
      };
      
      try {
        await axios.post('http://localhost:5000/api/admin/featured-talents', newFeatured);
        console.log(`✅ Added ${user.firstName} ${user.lastName} as featured talent`);
      } catch (error) {
        console.error(`❌ Error adding ${user.firstName} ${user.lastName} as featured:`, error.response?.data || error.message);
      }
    }
    
    console.log('🎉 Featured talent update completed!');
    
    // Show final results
    const finalFeatured = await axios.get('http://localhost:5000/api/featured-talents');
    console.log('\n📋 Final featured talents:');
    finalFeatured.data.forEach(ft => {
      console.log(`  - ${ft.user.firstName} ${ft.user.lastName} (${ft.category.name})`);
    });
    
  } catch (error) {
    console.error('Error updating featured talents:', error.response?.data || error.message);
  }
}

// Run the script
updateFeaturedTalents().catch(console.error);