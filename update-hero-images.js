const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateHeroImages() {
  try {
    // Update existing hero sections to use local images
    const updates = [
      { id: 36, imageUrl: '/images/hero_images/hero_1.svg' },
      { id: 37, imageUrl: '/images/hero_images/hero_2.svg' },
      { id: 38, imageUrl: '/images/hero_images/hero_3.svg' },
      { id: 39, imageUrl: '/images/hero_images/hero_4.svg' },
      { id: 40, imageUrl: '/images/hero_images/hero_5.svg' }
    ];

    for (const update of updates) {
      await prisma.heroSection.update({
        where: { id: update.id },
        data: { imageUrl: update.imageUrl }
      });
      console.log(`Updated hero section ${update.id} with ${update.imageUrl}`);
    }

    console.log('All hero sections updated successfully!');
  } catch (error) {
    console.error('Error updating hero sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHeroImages();
