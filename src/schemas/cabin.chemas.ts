import { z } from "zod";

const cabinItemSchema = z.object({
  name: z.string().min(1, "Cabin name is required"),
  capacity: z.number().positive("capacity must be greater than zero"),
});

export const createCabinsSchema = z.object({
  cabins: z.array(cabinItemSchema).min(1, '"cabins" must be a non-empty array'),
});
export type CreateCabinsInput = z.infer<typeof createCabinsSchema>;