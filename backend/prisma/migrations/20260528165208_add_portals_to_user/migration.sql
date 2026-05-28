-- AlterTable
ALTER TABLE "User" ADD COLUMN     "portals" TEXT[] DEFAULT ARRAY['vault']::TEXT[];
