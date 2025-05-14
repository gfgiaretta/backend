import { PrismaClient } from '@prisma/client';
import { HashService } from '../src/services/hash.service';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const hashService = new HashService();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        user_id: uuidv4(),
        name: 'Lucas Ribeiro',
        description: 'Ages II.',
        email: 'lucas@example.com',
        password: await hashService.hash('lucas123'),
        profile_picture_url: 'https://thispersondoesnotexist.com/',
        streak: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        user_id: uuidv4(),
        name: 'Leonardo Fagundes',
        description: 'Ages I',
        email: 'leonardo@example.com',
        password: await hashService.hash('leonardo123'),
        profile_picture_url: null,
        streak: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        user_id: uuidv4(),
        name: 'Eduardo Riboli',
        description: 'Ages III',
        email: 'eduardo@example.com',
        password: await hashService.hash('eduardo123'),
        profile_picture_url: 'https://thispersondoesnotexist.com/',
        streak: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });

  const user = await prisma.user.findUnique({
    where: {
      email: 'lucas@example.com',
    },
  });
  if (!user) {
    throw new Error('Usuário não encontrado!');
  }

  const user2 = await prisma.user.findUnique({
    where: {
      email: 'leonardo@example.com',
    },
  });
  if (!user2) {
    throw new Error('Usuário não encontrado!');
  }

  const interestIds: Record<string, string> = {
    Escrita: 'writing',
    Design: 'design',
    Música: 'music',
    Literatura: 'literature',
    Fotografia: 'photography',
    Jogos: 'games',
    Moda: 'fashion',
    Artesanato: 'crafts',
    Publicidade: 'marketing',
    Escultura: 'sculpture',
    Teatro: 'theatre',
    Ilustração: 'illustration',
    Arte: 'art',
  };

  const interests = Object.entries(interestIds).map(([title, id]) => ({
    interest_id: id,
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }));

  await prisma.interest.createMany({
    data: interests,
  });

  const getInterestId = (title: string): string => {
    const interest = interests.find((i) => i.title === title);
    if (!interest) {
      throw new Error(`Interesse com título "${title}" não encontrado`);
    }
    return String(interest.interest_id);
  };
  const designId = getInterestId('Design');
  const escritaId = getInterestId('Escrita');

  await prisma.exercise.createMany({
    data: [
      {
        exercise_id: uuidv4(),
        type: 'Narrativa Limitada',
        interest_id: escritaId,
        title: 'Jornada da Gratidão',
        description:
          'Aqui a ideia é exercitar o quanto podemos criar com tão pouco. Escreva uma narrativa com apenas 8 palavras sobre um romance não correspondido.',
        text_field: ['Gratidão 1', 'Gratidão 2', 'Gratidão 3'],
        image_url: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: designId,
        title: 'Desenhe seu mundo ideal',
        description:
          'Aqui a ideia é inverter a lógica de tudo que sabemos sobre a criação de marca. Desenhe sua versão do logo abaixo da pior maneira que conseguir',
        text_field: ['Natureza', 'Animais'],
        image_url: 'https://example.com/images/world.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });

  async function getExerciseIdByTitle(title: string): Promise<string> {
    const exercise = await prisma.exercise.findFirst({
      where: { title },
    });
    if (!exercise) {
      throw new Error(`Exercício com título "${title}" não encontrado!`);
    }
    return exercise.exercise_id;
  }

  const gratidaoId = await getExerciseIdByTitle('Jornada da Gratidão');
  const mundoIdealId = await getExerciseIdByTitle('Desenhe seu mundo ideal');

  await prisma.post.createMany({
    data: [
      {
        post_id: uuidv4(),
        owner_Id: user.user_id,
        title: 'Explorando a Criatividade Diária',
        description: 'Compartilho minha jornada com exercícios criativos!',
        image_url:
          'https://i.pinimg.com/736x/d1/b5/86/d1b5869f32a3519fe8152b1c381d3aeb.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        post_id: uuidv4(),
        owner_Id: user2.user_id,
        title: 'Sketchbook Digital #1',
        description: 'Alguns rascunhos do meu novo app!',
        image_url:
          'https://i.pinimg.com/736x/3b/d3/2e/3bd32eeb2cc3010f4652ccb615e4e6c2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });

  async function getPostIdByTitleAndOwner(
    title: string,
    ownerId: string,
  ): Promise<string> {
    const post = await prisma.post.findFirst({
      where: {
        title,
        owner_Id: ownerId,
      },
    });
    if (!post) {
      throw new Error(
        `Post com título "${title}" e owner_id "${ownerId}" não encontrado!`,
      );
    }
    return post.post_id;
  }

  const postId = await getPostIdByTitleAndOwner(
    'Explorando a Criatividade Diária',
    user.user_id,
  );

  const postId2 = await getPostIdByTitleAndOwner(
    'Sketchbook Digital #1',
    user2.user_id,
  );

  await prisma.library.createMany({
    data: [
      {
        library_id: uuidv4(),
        description: 'E-book: Criatividade e Neurociência',
        link: 'https://example.com/library/ebook-neuro',
        image_url:
          'https://i.pinimg.com/736x/62/23/d6/6223d6f82d5650e92e30e4d62b480177.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        library_id: uuidv4(),
        description: 'Guia Prático de Mindfulness',
        link: 'https://example.com/library/mindfulness-guide',
        image_url:
          'https://i.pinimg.com/736x/d0/4f/20/d04f207999ebe5e14714ed30e8089803.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  });

  async function getLibraryIdByDescription(description: string) {
    const library = await prisma.library.findFirst({
      where: { description },
      select: { library_id: true },
    });
    if (!library) {
      throw new Error(
        `Item de biblioteca com descrição "${description}" não encontrado.`,
      );
    }
    return library.library_id;
  }

  const ebookId = await getLibraryIdByDescription(
    'E-book: Criatividade e Neurociência',
  );
  const mindfulnessId = await getLibraryIdByDescription(
    'Guia Prático de Mindfulness',
  );

  await prisma.userExercise.createMany({
    data: [
      {
        user_id: user.user_id,
        exercise_id: gratidaoId,
      },
      {
        user_id: user2.user_id,
        exercise_id: mundoIdealId,
      },
    ],
  });

  await prisma.userSavedLibrary.createMany({
    data: [
      {
        user_id: user2.user_id,
        library_id: ebookId,
      },
      {
        user_id: user.user_id,
        library_id: mindfulnessId,
      },
    ],
  });

  await prisma.userSavedPost.createMany({
    data: [
      {
        user_id: user2.user_id,
        post_id: postId,
      },
      {
        user_id: user.user_id,
        post_id: postId2,
      },
    ],
  });

  await prisma.userInterest.createMany({
    data: [
      {
        user_id: user.user_id,
        interest_id: designId,
      },
      {
        user_id: user2.user_id,
        interest_id: escritaId,
      },
    ],
  });
}

main()
  .catch(() => {
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
