-- CreateTable
CREATE TABLE "store_depot_notes" (
    "id" SERIAL NOT NULL,
    "store_depot_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_depot_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_depot_notes" ADD CONSTRAINT "store_depot_note_store_depot_fk" FOREIGN KEY ("store_depot_id") REFERENCES "store_depots"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
