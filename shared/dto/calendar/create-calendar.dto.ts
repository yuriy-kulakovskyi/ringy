import z from "zod";

export const CreateCalendarDto = z.object({
  body: z.object({
    apiKey: z.string().min(1),
    provider: z.string().min(1),
  })
});