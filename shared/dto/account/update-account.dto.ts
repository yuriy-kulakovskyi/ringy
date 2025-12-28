import z from "zod";

export const UpdateAccountDto = z.object({
  body: z.object({
    phoneNumber: z.string().min(1).optional(),
    remindBeforeMinutes: z.number().min(0).optional(),
  })
});