-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "TrainingModule" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
