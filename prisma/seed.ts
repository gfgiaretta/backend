/* eslint-disable no-magic-numbers */
import { PrismaClient } from '@prisma/client';
import { HashService } from '../src/services/hash.service';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const hashService = new HashService();

const createDatePast = (daysAgo: number): Date => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() - daysAgo);
  return newDate;
};

async function main() {
  await prisma.user.createMany({
    data: [
      {
        user_id: uuidv4(),
        name: 'Lucas Ribeiro',
        description: 'Ages II.',
        email: 'lucas@example.com',
        password: await hashService.hash('lucas123'),
        profile_picture_path: 'profile2.jpg',
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
        profile_picture_path: 'profile1.jpg',
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
        profile_picture_path: 'profile2.jpg',
        streak: 4,
        createdAt: createDatePast(4),
        updatedAt: createDatePast(1),
        deletedAt: null,
      },
      {
        user_id: uuidv4(),
        name: 'Thiago Defini',
        description: 'Ages II',
        email: 'thiago@example.com',
        password: await hashService.hash('thiago123'),
        profile_picture_path: 'profile3.jpg',
        streak: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        user_id: uuidv4(),
        name: 'Flavia Tavaniello',
        description: 'Ages I',
        email: 'flavia@example.com',
        password: await hashService.hash('flavia123'),
        profile_picture_path: 'profile4.jpg',
        streak: 7,
        createdAt: createDatePast(2),
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

  const user3 = await prisma.user.findUnique({
    where: {
      email: 'eduardo@example.com',
    },
  });
  if (!user3) {
    throw new Error('Usuário não encontrado!');
  }

  const user4 = await prisma.user.findUnique({
    where: {
      email: 'thiago@example.com',
    },
  });
  if (!user4) {
    throw new Error('Usuário não encontrado!');
  }

  const user5 = await prisma.user.findUnique({
    where: {
      email: 'flavia@example.com',
    },
  });
  if (!user5) {
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
  const musicaId = getInterestId('Música');
  const fotografiaId = getInterestId('Fotografia');
  const jogosId = getInterestId('Jogos');
  const modaId = getInterestId('Moda');
  const artId = getInterestId('Arte');

  const contentArtisticConnectionExercise = [
    {
      "obra" : {
        "nome" : "Abaporu",
        "imagem" : "ab475b80-e705-4ae0-bcb2-6ebab0829163/1749937691809.jpeg"
      },
      "artista" : {
        "nome" : "Tarsila do Amaral",
        "imagem" : "45387fe3-4aa4-4e04-8525-1396eb1e74d3/1749938645707.jpeg"
      } 
    },
    {
      "obra" : {
        "nome" : "O Artesão",
        "imagem" : "45387fe3-4aa4-4e04-8525-1396eb1e74d3/1749939023021.jpeg"
      },
      "artista" : {
        "nome" : "Vicente do Rego Monteiro",
        "imagem" : "45387fe3-4aa4-4e04-8525-1396eb1e74d3/1749939091913.jpeg"
      } 
    },
    {
      "obra" : {
        "nome" : "Paisagem da Espanha",
        "imagem" : "45387fe3-4aa4-4e04-8525-1396eb1e74d3/1749939138479.jpeg"
      },
      "artista" : {
        "nome" : "John Graz",
        "imagem" : "45387fe3-4aa4-4e04-8525-1396eb1e74d3/1749939191031.jpeg"
      } 
    }
  ]

  await prisma.exercise.createMany({
    data: [
      {
        exercise_id: uuidv4(),
        type: 'Narrativa Limitada',
        interest_id: escritaId,
        title: 'Jornada da Gratidão',
        description:
          'Aqui a ideia é exercitar o quanto podemos criar com tão pouco. Escreva uma narrativa com apenas 8 palavras sobre um romance não correspondido.',
        content: { text_field: ['Gratidão 1', 'Gratidão 2', 'Gratidão 3'] },
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
        content: { image_url: 'https://example.com/images/world.jpg' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: designId,
        title: 'Desenhe somente com uma cor!',
        description:
          'Aqui a ideia é inverter a lógica de tudo que sabemos sobre a criação de marca. Desenhe sua versão do logo abaixo da pior maneira que conseguir',
        content: { image_url: 'https://example.com/images/world.jpg' },
        createdAt: createDatePast(1),
        updatedAt: createDatePast(1),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: designId,
        title: 'Que tal inverter as coisas?',
        description:
          'Aqui a ideia é inverter a lógica de tudo que sabemos sobre a criação de marca. Desenhe sua versão do logo abaixo da pior maneira que conseguir',
        content: { image_url: 'https://example.com/images/world.jpg' },
        createdAt: createDatePast(2),
        updatedAt: createDatePast(2),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: designId,
        title: 'Desenhe seu maior sonho',
        description:
          'Aqui a ideia é inverter a lógica de tudo que sabemos sobre a criação de marca. Desenhe sua versão do logo abaixo da pior maneira que conseguir',
        content: { image_url: 'https://example.com/images/world.jpg' },
        createdAt: createDatePast(3),
        updatedAt: createDatePast(3),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: designId,
        title: 'Vamos criar uma logo?',
        description:
          'Aqui a ideia é inverter a lógica de tudo que sabemos sobre a criação de marca. Desenhe sua versão do logo abaixo da pior maneira que conseguir',
        content: { image_url: 'https://example.com/images/world.jpg' },
        createdAt: createDatePast(4),
        updatedAt: createDatePast(4),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Narrativa Limitada',
        interest_id: musicaId,
        title: 'Melodia da Natureza',
        description:
          'Crie uma pequena melodia inspirada nos sons da natureza, usando apenas 3 instrumentos.',
        content: { audio_prompt: 'sons_da_natureza.mp3' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: fotografiaId,
        title: 'A Cidade e Suas Cores',
        description:
          'Capture 5 fotos que representem as cores vibrantes ou monocromáticas da cidade ao seu redor.',
        content: { text_field: ['cidade_cores'] },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Narrativa Limitada',
        interest_id: jogosId,
        title: 'Herói Inusitado',
        description:
          'Desenvolva um herói de videogame com poderes e fraquezas baseados em objetos do dia a dia.',
        content: { text_field: ['heroi_inusitado'] },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Inversão',
        interest_id: modaId,
        title: 'Futurismo Urbano',
        description:
          'Crie um esboço de uma peça de vestuário inspirada na arquitetura futurista e na vida urbana.',
        content: { text_field: ['esboco_moda'] },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        exercise_id: uuidv4(),
        type: 'Conexão Artística',
        interest_id: artId,
        title: 'Arte Moderna',
        description:
          'Aqui a ideia é refrescar a memória sobre a arte moderna. Relacione o artista com sua respectiva obra, selecionando-os um depois do outro.',
        content: contentArtisticConnectionExercise,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
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

  async function getExercisesIdByInterest(
    interest_id: string,
  ): Promise<string[]> {
    const exercises = await prisma.exercise.findMany({
      where: { interest_id },
    });
    if (!exercises) {
      throw new Error(
        `Exercício com interesse "${interest_id}" não encontrado!`,
      );
    }
    const exercises_ids = exercises.map((ex) => ex.exercise_id);
    return exercises_ids;
  }

  const gratidaoId = await getExerciseIdByTitle('Jornada da Gratidão');
  const mundoIdealId = await getExerciseIdByTitle('Desenhe seu mundo ideal');
  const melodiaNaturezaId = await getExerciseIdByTitle('Melodia da Natureza');
  const cidadeCoresId = await getExerciseIdByTitle('A Cidade e Suas Cores');
  const heroiInusitadoId = await getExerciseIdByTitle('Herói Inusitado');
  const futurismoUrbanoId = await getExerciseIdByTitle('Futurismo Urbano');

  const designExercisesId = await getExercisesIdByInterest(designId);

  await prisma.post.createMany({
    data: [
      {
        post_id: uuidv4(),
        owner_Id: user.user_id,
        title: 'Explorando a Criatividade Diária',
        description: 'Compartilho minha jornada com exercícios criativos!',
        image_url: 'post1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        post_id: uuidv4(),
        owner_Id: user2.user_id,
        title: 'Sketchbook Digital #1',
        description: 'Alguns rascunhos do meu novo app!',
        image_url: 'post2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        post_id: uuidv4(),
        owner_Id: user3.user_id,
        title: 'Releitura de Davi de Michelangelo',
        description: 'Releitura da famosa escultura Davi de Michelangelo',
        image_url: 'post3.jpg',
        createdAt: createDatePast(1),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        post_id: uuidv4(),
        owner_Id: user4.user_id,
        title: 'Minhas novas ilustrações',
        description: 'Adorei explorar essa técnica de aquarela digital.',
        image_url: 'post4.jpg',
        createdAt: createDatePast(1),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        post_id: uuidv4(),
        owner_Id: user5.user_id,
        title: 'Pensamentos sobre o novo rumo da moda',
        description: 'Um overview sobre as novas tendências da moda.',
        image_url: 'post5.jpg',
        createdAt: createDatePast(2),
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

  const postId3 = await getPostIdByTitleAndOwner(
    'Releitura de Davi de Michelangelo',
    user3.user_id,
  );

  const postId4 = await getPostIdByTitleAndOwner(
    'Minhas novas ilustrações',
    user4.user_id,
  );

  const postId5 = await getPostIdByTitleAndOwner(
    'Pensamentos sobre o novo rumo da moda',
    user5.user_id,
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
      {
        library_id: uuidv4(),
        description: 'Artigo: O Poder do Hábito',
        link: 'https://example.com/library/power-of-habit',
        image_url:
          'https://i.pinimg.com/736x/89/3e/2a/893e2a7e7c8f9f7d4b1a2e7c8a9f7e5d.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        library_id: uuidv4(),
        description: 'Livro: O Caminho do Artista',
        link: 'https://example.com/library/artist-way',
        image_url:
          'https://i.pinimg.com/736x/2b/9a/3c/2b9a3c8e7e0e7a2b9f7d4b1a2e7c8a9f7e5d.jpg',
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
  const poderHabitoId = await getLibraryIdByDescription(
    'Artigo: O Poder do Hábito',
  );
  const caminhoArtistaId = await getLibraryIdByDescription(
    'Livro: O Caminho do Artista',
  );

  await prisma.userExercise.createMany({
    data: [
      {
        user_id: user.user_id,
        exercise_id: gratidaoId,
        content: {},
      },
      {
        user_id: user2.user_id,
        exercise_id: mundoIdealId,
        content: {},
      },
      {
        user_id: user3.user_id,
        exercise_id: designExercisesId[1],
        createdAt: createDatePast(1),
        updatedAt: createDatePast(1),
        content: {},
      },
      {
        user_id: user3.user_id,
        exercise_id: designExercisesId[2],
        createdAt: createDatePast(2),
        updatedAt: createDatePast(2),
        content: {},
      },
      {
        user_id: user3.user_id,
        exercise_id: designExercisesId[3],
        createdAt: createDatePast(3),
        updatedAt: createDatePast(3),
        content: {},
      },
      {
        user_id: user3.user_id,
        exercise_id: designExercisesId[4],
        createdAt: createDatePast(4),
        updatedAt: createDatePast(4),
        content: {},
      },
      {
        user_id: user4.user_id,
        exercise_id: melodiaNaturezaId,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: user5.user_id,
        exercise_id: cidadeCoresId,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: user.user_id,
        exercise_id: heroiInusitadoId,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: user2.user_id,
        exercise_id: futurismoUrbanoId,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
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
      {
        user_id: user3.user_id,
        library_id: poderHabitoId,
      },
      {
        user_id: user4.user_id,
        library_id: caminhoArtistaId,
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
      {
        user_id: user3.user_id,
        post_id: postId3,
      },
      {
        user_id: user4.user_id,
        post_id: postId4,
      },
      {
        user_id: user5.user_id,
        post_id: postId5,
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
        user_id: user.user_id,
        interest_id: artId,
      },
      {
        user_id: user2.user_id,
        interest_id: escritaId,
      },
      {
        user_id: user2.user_id,
        interest_id: artId,
      },
      {
        user_id: user3.user_id,
        interest_id: escritaId,
      },
      {
        user_id: user3.user_id,
        interest_id: designId,
      },
      {
        user_id: user3.user_id,
        interest_id: musicaId,
      },
      {
        user_id: user4.user_id,
        interest_id: fotografiaId,
      },
      {
        user_id: user4.user_id,
        interest_id: musicaId,
      },
      {
        user_id: user5.user_id,
        interest_id: jogosId,
      },
      {
        user_id: user5.user_id,
        interest_id: modaId,
      },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        user_id: user2.user_id,
        post_id: postId,
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      },
      {
        user_id: user3.user_id,
        post_id: postId,
        content: "Teste 2 🎨"
      },
      {
        user_id: user.user_id,
        post_id: postId2,
        content: "Hehe"
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
