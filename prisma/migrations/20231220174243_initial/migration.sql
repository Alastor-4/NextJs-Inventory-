-- CreateTable
CREATE TABLE "characteristics" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "name" VARCHAR(255),
    "value" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileKey" VARCHAR(255),
    "fileUrl" VARCHAR(255),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depots" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "warehouse_id" INTEGER,
    "inserted_by_id" INTEGER,
    "product_total_units" INTEGER,
    "product_total_remaining_units" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "owner_id" INTEGER,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "buy_price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_store_transfers" (
    "id" SERIAL NOT NULL,
    "store_depot_id" INTEGER,
    "units_transferred_quantity" INTEGER,
    "from_store_accepted" BOOLEAN DEFAULT false,
    "to_store_id" INTEGER,
    "to_store_accepted" BOOLEAN DEFAULT false,
    "transfer_notes" TEXT,
    "transfer_cancelled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_store_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_depot_transfers" (
    "id" SERIAL NOT NULL,
    "store_depot_id" INTEGER,
    "units_transferred_quantity" INTEGER,
    "transfer_direction" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_depot_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_depots" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER,
    "depot_id" INTEGER,
    "product_units" INTEGER,
    "product_remaining_units" INTEGER,
    "seller_profit_percentage" REAL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT false,
    "sell_price" DECIMAL(10,2) DEFAULT 0.00,
    "sell_price_unit" VARCHAR(100) DEFAULT 'CUP',
    "seller_profit_quantity" REAL,
    "price_discount_percentage" REAL,
    "price_discount_quantity" REAL,
    "seller_profit_unit" VARCHAR(255),

    CONSTRAINT "store_depots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "slogan" VARCHAR(255),
    "address" VARCHAR(255),
    "seller_user_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auto_open_time" BOOLEAN DEFAULT true,
    "auto_reservation_time" BOOLEAN DEFAULT true,
    "fixed_seller_profit_percentage" REAL,
    "online_catalog" BOOLEAN DEFAULT false,
    "online_reservation" BOOLEAN DEFAULT false,
    "fixed_seller_profit_quantity" REAL,
    "fixed_seller_profit_unit" VARCHAR(255),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "role_id" INTEGER,
    "name" VARCHAR(255),
    "mail" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "is_verified" BOOLEAN DEFAULT false,
    "work_for_user_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "address" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_open_days" (
    "id" SERIAL NOT NULL,
    "week_day_number" SMALLINT NOT NULL,
    "day_start_time" TIME(0) NOT NULL,
    "day_end_time" TIME(0) NOT NULL,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "store_open_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_reservation_days" (
    "id" SERIAL NOT NULL,
    "week_day_number" SMALLINT NOT NULL,
    "day_start_time" TIME(0) NOT NULL,
    "day_end_time" TIME(0) NOT NULL,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "store_reservation_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_collection_depots" (
    "id" SERIAL NOT NULL,
    "store_collection_id" INTEGER NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_collection_depots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_collections" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT false,

    CONSTRAINT "store_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_messages" (
    "id" SERIAL NOT NULL,
    "sender" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "was_read" BOOLEAN DEFAULT false,
    "product_reservation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_status" (
    "id" SERIAL NOT NULL,
    "code" SMALLINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_units" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_offers" (
    "id" SERIAL NOT NULL,
    "compare_units_quantity" INTEGER NOT NULL,
    "compare_function" VARCHAR(100) NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_products" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "units_quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "payment_method" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requesting_user_id" INTEGER NOT NULL,
    "request_delivery" BOOLEAN NOT NULL DEFAULT false,
    "delivery_notes" TEXT,
    "status_description" TEXT,
    "applied_offer" JSON,
    "applied_discount" JSON,
    "status_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_products" (
    "id" SERIAL NOT NULL,
    "sell_id" INTEGER NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "units_quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sell_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sells" (
    "id" SERIAL NOT NULL,
    "total_price" DOUBLE PRECISION,
    "payment_method" VARCHAR(255),
    "units_returned_quantity" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(0),
    "returned_reason" TEXT,
    "from_reservation_id" INTEGER,
    "requesting_user_id" INTEGER,

    CONSTRAINT "sells_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characteristic_product_id" ON "characteristics"("product_id");

-- CreateIndex
CREATE INDEX "image_product_id" ON "images"("product_id");

-- CreateIndex
CREATE INDEX "warehouse_id" ON "depots"("warehouse_id");

-- CreateIndex
CREATE INDEX "product_id" ON "depots"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "depots_product_id_warehouse_id_key" ON "depots"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "department_id" ON "products"("department_id");

-- CreateIndex
CREATE INDEX "product_store_transfers_store_depot_fkey" ON "product_store_transfers"("store_depot_id");

-- CreateIndex
CREATE INDEX "product_store_transfers_store_fkey" ON "product_store_transfers"("to_store_id");

-- CreateIndex
CREATE INDEX "store_depot_transfers_store_depot_fkey" ON "store_depot_transfers"("store_depot_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_name" ON "roles"("name");

-- CreateIndex
CREATE INDEX "depot_id" ON "store_depots"("depot_id");

-- CreateIndex
CREATE INDEX "store_id" ON "store_depots"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_depots_store_id_depot_id_key" ON "store_depots"("store_id", "depot_id");

-- CreateIndex
CREATE UNIQUE INDEX "name" ON "stores"("name");

-- CreateIndex
CREATE INDEX "store_owner_id" ON "stores"("owner_id");

-- CreateIndex
CREATE INDEX "stores_FK" ON "stores"("seller_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mail" ON "users"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "phone" ON "users"("phone");

-- CreateIndex
CREATE INDEX "role_id" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "owner_id" ON "warehouses"("owner_id");

-- CreateIndex
CREATE INDEX "store_open_days_FK" ON "store_open_days"("store_id");

-- CreateIndex
CREATE INDEX "store_reservation_days_FK" ON "store_reservation_days"("store_id");

-- CreateIndex
CREATE INDEX "store_collection_depot_FK" ON "store_collection_depots"("store_collection_id");

-- CreateIndex
CREATE INDEX "store_collection_depot_FK_1" ON "store_collection_depots"("store_depot_id");

-- CreateIndex
CREATE INDEX "store_collections_FK" ON "store_collections"("store_id");

-- CreateIndex
CREATE INDEX "reservation_messages_FK" ON "reservation_messages"("product_reservation_id");

-- CreateIndex
CREATE INDEX "NewTable_FK" ON "product_offers"("store_depot_id");

-- CreateIndex
CREATE INDEX "reservation_products_reservation_id_FK" ON "reservation_products"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_products_store_depot_id_FK" ON "reservation_products"("store_depot_id");

-- CreateIndex
CREATE INDEX "products_reservation_FK" ON "reservations"("status_id");

-- CreateIndex
CREATE INDEX "products_reservation_user_FK" ON "reservations"("requesting_user_id");

-- CreateIndex
CREATE INDEX "reservation_products_FK" ON "sell_products"("sell_id");

-- CreateIndex
CREATE INDEX "reservation_products_FK_1" ON "sell_products"("store_depot_id");

-- CreateIndex
CREATE INDEX "products_sell_FK" ON "sells"("from_reservation_id");

-- CreateIndex
CREATE INDEX "sells_FK" ON "sells"("requesting_user_id");

-- AddForeignKey
ALTER TABLE "characteristics" ADD CONSTRAINT "characteristics_ibfk_1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_ibfk_1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "depots" ADD CONSTRAINT "depots_ibfk_1" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "depots" ADD CONSTRAINT "depots_ibfk_2" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_ibfk_1" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "product_store_transfers" ADD CONSTRAINT "product_store_transfers_store_depot_id_fkey" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_store_transfers" ADD CONSTRAINT "product_store_transfers_to_store_id_fkey" FOREIGN KEY ("to_store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_depot_transfers" ADD CONSTRAINT "store_depot_transfers_store_depot_id_fkey" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_depots" ADD CONSTRAINT "store_depots_ibfk_1" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_depots" ADD CONSTRAINT "store_depots_ibfk_2" FOREIGN KEY ("depot_id") REFERENCES "depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "store_seller_FK" FOREIGN KEY ("seller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "store_owner_FK" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ibfk_1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_ibfk_1" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_open_days" ADD CONSTRAINT "store_open_days_store_FK" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_reservation_days" ADD CONSTRAINT "store_reservation_days_store_FK" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_collection_depots" ADD CONSTRAINT "store_collection_depot_store_collection_FK" FOREIGN KEY ("store_collection_id") REFERENCES "store_collections"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_collection_depots" ADD CONSTRAINT "store_collection_depot_store_depot" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "store_collections" ADD CONSTRAINT "store_collections_store_collection_depot_FK" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "reservation_messages" ADD CONSTRAINT "reservation_messages_products_reservation_FK" FOREIGN KEY ("product_reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_store_depots_FK" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "reservation_products" ADD CONSTRAINT "reservation_products_reservations_FK" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "reservation_products" ADD CONSTRAINT "reservation_products_store_depots_FK" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservation_reservation_status_FK" FOREIGN KEY ("status_id") REFERENCES "reservation_status"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservation_user_FK" FOREIGN KEY ("requesting_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sell_products" ADD CONSTRAINT "sell_products_FK" FOREIGN KEY ("sell_id") REFERENCES "sells"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sell_products" ADD CONSTRAINT "sell_products_FK_1" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_reservations_FK" FOREIGN KEY ("from_reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_users_FK" FOREIGN KEY ("requesting_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
