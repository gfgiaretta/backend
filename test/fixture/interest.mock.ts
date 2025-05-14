import { Interest } from '@prisma/client';

export function mockInterest(id: string): Interest {
  return {
    interest_id: id,
    title: `Interest ${id}`,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  };
}

export const mockInterestList: Interest[] = [
  mockInterest('int001'),
  mockInterest('int002'),
  mockInterest('int003'),
];
