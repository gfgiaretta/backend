export const authMocks = {
  hash: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
  jwt: {
    signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
  },
};
