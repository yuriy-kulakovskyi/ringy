import 'dotenv/config'

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@config/env";

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter, log: [
  { level: 'query', emit: 'event' },
  { level: 'info', emit: 'event' },
  { level: 'warn', emit: 'event' },
  { level: 'error', emit: 'event' },
] });

prisma.$on('query', (e) => {
  if (e.duration > 200) {
    console.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
  }
});

export default prisma;