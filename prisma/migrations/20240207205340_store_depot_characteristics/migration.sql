-- CreateTable
CREATE TABLE "store_depot_characteristics" (
    "id" SERIAL NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_depot_characteristics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_depot_characteristics" ADD CONSTRAINT "store_depot_note_store_depot_fk" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
