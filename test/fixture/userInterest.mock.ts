import { UserInterest } from '@prisma/client';

export function mockUserInterest({
  user_id,
  interest_id,
  createdAt,
  updatedAt,
  deletedAt,
}: Partial<UserInterest>): UserInterest {
  return {
    user_id: user_id || '6a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
    interest_id: interest_id || 'acd12345-6789-0abc-def1-23456789abcd',
    createdAt: createdAt || new Date('2025-01-01'),
    updatedAt: updatedAt || new Date('2025-01-01'),
    deletedAt: deletedAt || null,
  };
}
export const mockTestUserInterest: UserInterest = mockUserInterest({});

export const mockUserInterestList: UserInterest[] = [
  mockUserInterest({ interest_id: 'user001' }),
  mockUserInterest({ interest_id: 'user002' }),
  mockUserInterest({ interest_id: 'user003' }),
];
