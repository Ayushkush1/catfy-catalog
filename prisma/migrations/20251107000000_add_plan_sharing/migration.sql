-- Add plan_sharing_enabled column to Catalogue table
ALTER TABLE "Catalogue" 
ADD COLUMN IF NOT EXISTS "planSharingEnabled" BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN "Catalogue"."planSharingEnabled" IS 'Whether the owner shares their subscription plan benefits with team members for this catalogue';
