import { PrismaClient } from "@prisma/client";

class PrismaService {
  private static instance: PrismaClient;

  static getClient(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient();
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getClient();
