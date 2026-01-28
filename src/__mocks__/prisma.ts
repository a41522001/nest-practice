// Mock Prisma Client for testing
export const PrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

export const Prisma = {
  TransactionScalarFieldEnum: {},
};
