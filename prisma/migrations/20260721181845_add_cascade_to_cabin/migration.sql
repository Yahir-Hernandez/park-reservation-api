-- DropForeignKey
ALTER TABLE "cabin" DROP CONSTRAINT "cabin_park_id_fkey";

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "park"("id") ON DELETE CASCADE ON UPDATE CASCADE;
