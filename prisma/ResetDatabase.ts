import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
//Only run this function if you must reset the database, otherwise ignore it
//can only be used in determined circumstances, they delete all the data in our database, each of the functions delete one table
async function resetDatabase() {
  try {
    await prisma.userSavedPost.deleteMany();
    await prisma.userInterest.deleteMany();
    await prisma.userExercise.deleteMany();
    await prisma.userSavedLibrary.deleteMany();
    await prisma.post.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.library.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.user.deleteMany();
  } catch {
    throw new Error('Error while resetting database');
  } finally {
    await prisma.$disconnect();
  }
}
void resetDatabase();
