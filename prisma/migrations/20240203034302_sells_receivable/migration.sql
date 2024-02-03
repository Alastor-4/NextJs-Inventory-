-- CreateEnum
CREATE TYPE "sell_receivable_status" AS ENUM ('PENDIENTE', 'CANCELADA', 'EXTENDIDA', 'COBRADA');

-- CreateTable
CREATE TABLE "sells_receivable" (
    "id" SERIAL NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_method" VARCHAR(255),
    "pay_before_date" TIMESTAMP(0),
    "payed_at" TIMESTAMP(0),
    "status" "sell_receivable_status" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sells_receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_receivable_products" (
    "id" SERIAL NOT NULL,
    "sell_receivable_id" INTEGER NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "units_quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sell_receivable_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sell_receivable_products" ADD CONSTRAINT "sell_receivable_product_FK" FOREIGN KEY ("sell_receivable_id") REFERENCES "sells_receivable"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sell_receivable_products" ADD CONSTRAINT "sell_receivable_store_depot_FK" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
