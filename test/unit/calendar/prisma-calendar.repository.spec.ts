jest.mock("prisma/prisma.service", () => ({
  __esModule: true,
  default: {
    calendar: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));


import { PrismaCalendarRepository } from "@modules/calendar/infrastructure/prisma-calendar.repository";
import prisma from "prisma/prisma.service";
import { AppError } from "@shared/errors/app-error";

type PrismaCalendarMock = {
  calendar: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

const prismaMock = prisma as unknown as PrismaCalendarMock;

describe("PrismaCalendarRepository", () => {
  let repository: PrismaCalendarRepository;

  beforeEach(() => {
    repository = new PrismaCalendarRepository();
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("should create calendar successfully", async () => {
      prismaMock.calendar.findFirst.mockResolvedValue(null);
      prismaMock.calendar.create.mockResolvedValue({
        id: "cal-1",
        userId: "user-1",
        accountId: "acc-1",
        provider: "google",
        apiKey: "key-123",
      });

      const result = await repository.create({
        userId: "user-1",
        accountId: "acc-1",
        provider: "google",
        apiKey: "key-123",
      });

      expect(prismaMock.calendar.findFirst).toHaveBeenCalled();
      expect(prismaMock.calendar.create).toHaveBeenCalled();
      expect(result.id).toBe("cal-1");
    });

    it("should throw error if calendar already exists", async () => {
      prismaMock.calendar.findFirst.mockResolvedValue({ id: "existing" });

      await expect(
        repository.create({
          userId: "user-1",
          accountId: "acc-1",
          provider: "google",
          apiKey: "key",
        })
      ).rejects.toThrow(AppError);
    });

    it("should throw error if required fields are missing", async () => {
      await expect(
        repository.create({
          userId: "",
          accountId: "",
          provider: "google",
          apiKey: "",
        })
      ).rejects.toThrow("Missing required fields");
    });
  });

  describe("update()", () => {
    it("should update calendar apiKey", async () => {
      prismaMock.calendar.update.mockResolvedValue({
        id: "cal-1",
        userId: "user-1",
        accountId: "acc-1",
        provider: "google",
        apiKey: "new-key",
      });

      const result = await repository.update({
        id: "cal-1",
        userId: "user-1",
        apiKey: "new-key",
      });

      expect(prismaMock.calendar.update).toHaveBeenCalledWith({
        where: { id: "cal-1", userId: "user-1" },
        data: { apiKey: "new-key" },
      });

      expect(result.apiKey).toBe("new-key");
    });

    it("should throw error if id or userId missing", async () => {
      await expect(
        repository.update({
          id: "",
          userId: "",
          apiKey: "key",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("findById()", () => {
    it("should return calendar entity", async () => {
      prismaMock.calendar.findFirst.mockResolvedValue({
        id: "cal-1",
        userId: "user-1",
        accountId: "acc-1",
        provider: "google",
        apiKey: "key",
      });

      const result = await repository.findById("cal-1", "user-1");

      expect(prismaMock.calendar.findFirst).toHaveBeenCalled();
      expect(result?.id).toBe("cal-1");
    });

    it("should return null if calendar not found", async () => {
      prismaMock.calendar.findFirst.mockResolvedValue(null);

      const result = await repository.findById("cal-1", "user-1");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId()", () => {
    it("should return list of calendars", async () => {
      prismaMock.calendar.findMany.mockResolvedValue([
        {
          id: "cal-1",
          userId: "user-1",
          accountId: "acc-1",
          provider: "google",
          apiKey: "key",
        },
      ]);

      const result = await repository.findByUserId("user-1");

      expect(prismaMock.calendar.findMany).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("cal-1");
    });

    it("should return empty array if no calendars", async () => {
      prismaMock.calendar.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("delete()", () => {
    it("should soft delete calendar", async () => {
      prismaMock.calendar.update.mockResolvedValue({});

      const result = await repository.delete("cal-1");

      expect(prismaMock.calendar.update).toHaveBeenCalledWith({
        where: { id: "cal-1" },
        data: { isDeleted: true },
      });

      expect(result.success).toBe(true);
    });

    it("should throw error if id missing", async () => {
      await expect(repository.delete("")).rejects.toThrow(AppError);
    });
  });
});