/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from './index';

export const extendedPrismaClient = () => {
  return prisma.$extends({
    name: 'softDelete',
    query: {
      $allModels: {
        // Intercept delete operations to turn them into updates
        async delete({ model, args, query }: any) {
          return (prisma as any)[model].update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ model, args, query }: any) {
          return (prisma as any)[model].updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        // Filter out soft-deleted records on read queries
        async findMany({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirstOrThrow({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUnique({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUniqueOrThrow({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async count({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async aggregate({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async groupBy({ args, query }: any) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof extendedPrismaClient>;
