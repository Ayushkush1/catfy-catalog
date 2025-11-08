-- AlterTable
ALTER TABLE "team_members" ADD COLUMN "hasPremiumAccess" BOOLEAN NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN "team_members"."hasPremiumAccess" IS 'Whether this team member has access to the owner''s premium plan features for this catalogue';
