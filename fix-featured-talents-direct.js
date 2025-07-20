// Direct database update for featured talents using the storage layer
import { storage } from './server/simple-storage.js';

async function fixFeaturedTalentsDirectly() {
  console.log('🔧 Fixing featured talents directly through storage...');
  
  try {
    // Get current featured talents
    const currentFeatured = await storage.getFeaturedTalents();
    console.log(`Found ${currentFeatured.length} featured talents`);
    
    // Find problematic entries to replace
    const problematicEntries = currentFeatured.filter(ft => 
      !ft.user || !ft.user.firstName || 
      ft.user.firstName === 'undefined' || 
      ft.user.firstName === 'pdf' || 
      ft.user.firstName === 'Tom' ||
      !ft.user.profileImageUrl
    );
    
    console.log(`Found ${problematicEntries.length} problematic entries to fix:`);
    problematicEntries.forEach(entry => {
      console.log(`  - ID ${entry.id}: ${entry.user?.firstName || 'undefined'} ${entry.user?.lastName || 'undefined'}`);
    });
    
    // Delete problematic entries
    for (const entry of problematicEntries) {
      try {
        await storage.deleteFeaturedTalent(entry.id);
        console.log(`✅ Deleted problematic entry: ${entry.user?.firstName || 'undefined'} ${entry.user?.lastName || 'undefined'}`);
      } catch (error) {
        console.error(`❌ Error deleting entry ${entry.id}:`, error.message);
      }
    }
    
    // Get updated list
    const updatedFeatured = await storage.getFeaturedTalents();
    console.log(`✅ After cleanup: ${updatedFeatured.length} featured talents remaining`);
    
    // Add new professional profiles if we have space (keep to max 8)
    const remainingSlots = 8 - updatedFeatured.length;
    if (remainingSlots > 0) {
      console.log(`Adding ${remainingSlots} new professional profiles...`);
      
      // Professional profiles to add based on realistic user IDs
      const newProfessionalEntries = [
        {
          userId: 76, // Maya Thompson
          categoryId: 1, // Featured Performer
          featuredReason: "Emmy-nominated actress with powerful dramatic performances",
          displayOrder: updatedFeatured.length + 1,
          isActive: true
        },
        {
          userId: 77, // James Carter
          categoryId: 1, // Featured Performer  
          featuredReason: "Versatile actor with blockbuster and indie success",
          displayOrder: updatedFeatured.length + 2,
          isActive: true
        },
        {
          userId: 78, // Luna Roswell
          categoryId: 2, // Rising Star
          featuredReason: "Grammy-winning singer-songwriter with ethereal vocals",
          displayOrder: updatedFeatured.length + 3,
          isActive: true
        },
        {
          userId: 79, // Zara Divine
          categoryId: 4, // Breakthrough Artist
          featuredReason: "International supermodel with major fashion campaigns",
          displayOrder: updatedFeatured.length + 4,
          isActive: true
        }
      ];
      
      // Add only as many as we have slots for
      const entriesToAdd = newProfessionalEntries.slice(0, remainingSlots);
      
      for (const entry of entriesToAdd) {
        try {
          const result = await storage.createFeaturedTalent(entry);
          console.log(`✅ Added new featured talent with user ID ${entry.userId}`);
        } catch (error) {
          console.error(`❌ Error adding featured talent with user ID ${entry.userId}:`, error.message);
        }
      }
    }
    
    // Show final results
    const finalFeatured = await storage.getFeaturedTalents();
    console.log(`\n🎉 Final featured talents (${finalFeatured.length} total):`);
    finalFeatured.forEach(ft => {
      const userName = ft.user ? `${ft.user.firstName} ${ft.user.lastName}` : 'Unknown User';
      const categoryName = ft.category ? ft.category.name : 'Unknown Category';
      console.log(`  - ${userName} (${categoryName})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing featured talents:', error.message);
  }
}

// Run the fix
fixFeaturedTalentsDirectly().catch(console.error);