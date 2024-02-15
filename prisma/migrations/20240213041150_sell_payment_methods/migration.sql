/*
  Warnings:

  - You are about to drop the `payment_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_units` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "payment_methods_enum" AS ENUM ('TransferenciaCUP', 'EfectivoCUP', 'Otro');

-- DropTable
DROP TABLE "payment_methods";

-- DropTable
DROP TABLE "payment_units";

-- CreateTable
CREATE TABLE "sell_payment_methods" (
    "id" SERIAL NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "payment_methods_enum" NOT NULL DEFAULT 'EfectivoCUP',
    "sells_id" INTEGER,
    "sells_receivable_id" INTEGER,

    CONSTRAINT "sell_payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sell_payment_methods" ADD CONSTRAINT "sell_payment_methods_sells_id_fkey" FOREIGN KEY ("sells_id") REFERENCES "sells"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_payment_methods" ADD CONSTRAINT "sell_payment_methods_sells_receivable_id_fkey" FOREIGN KEY ("sells_receivable_id") REFERENCES "sells_receivable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
