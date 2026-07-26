import { z } from "zod";

export const createReservationSchema = z.object({
  parkId: z.number(),
  cabinId: z.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  people: z.number().positive("people must be greater than zero"),
  visitType: z.enum(["cabaña", "camping"]),
  userId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.visitType === "cabaña" && data.cabinId === undefined) {
    ctx.addIssue({
      code: "custom",
      message: '"cabinId" is required when "visitType" is "cabaña"',
      path: ["cabinId"],
    });
  }
  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: "custom",
      message: '"startDate" must be before or equal to "endDate"',
      path: ["endDate"],
    });
  }
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;