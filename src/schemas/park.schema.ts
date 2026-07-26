import { z } from "zod";

export const createParkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  services: z.array(z.string()),
  openingTime: z.coerce.date(),
  closingTime: z.coerce.date(),
  latitude: z.number(),
  longitude: z.number(),
  startSeason: z.coerce.date(),
  endSeason: z.coerce.date(),
  closeDays: z.array(z.string()),
  hasCabins: z.boolean().default(false),
  capacityCamping: z.number().positive("capacityCamping must be greater than zero"),
});
export type CreateParkInput = z.infer<typeof createParkSchema>;


export const updateParkSchema = createParkSchema.partial();
export type UpdateParkInput = z.infer<typeof updateParkSchema>;