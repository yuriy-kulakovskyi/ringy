import z from "zod";

export const UpdateCalendarDto = z.object({
  body: z.object({
    apiKey: z.string().min(1),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});