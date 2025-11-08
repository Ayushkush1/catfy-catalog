-- AlterTable
ALTER TABLE "catalogues" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- Add comment
COMMENT ON COLUMN "catalogues"."version" IS 'Version number for optimistic locking and conflict detection';
