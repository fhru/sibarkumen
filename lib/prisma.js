import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : ["error"],
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    if (e.duration > 100) {
      console.warn(`Slow query (${e.duration}ms):`, e.query);
    }
  });
}

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
