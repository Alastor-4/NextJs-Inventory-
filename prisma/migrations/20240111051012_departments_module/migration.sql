-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "usersId" INTEGER,
ALTER COLUMN "created_at" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "department_user_FK" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
