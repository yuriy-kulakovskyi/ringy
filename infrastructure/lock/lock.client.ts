import prisma from "prisma/prisma.service";

export async function acquireLock(name: string): Promise<boolean> {
  try {
    await prisma.cronLock.create({
      data: { name, lockedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseLock(name: string) {
  await prisma.cronLock.delete({ where: { name } });
}