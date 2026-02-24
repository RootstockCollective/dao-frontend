-- AlterColumn: make likedAt NOT NULL (matches Prisma schema expectation)
-- Safe because all existing rows have a value via DEFAULT NOW()
ALTER TABLE "dao_data"."ProposalLikes" ALTER COLUMN "likedAt" SET NOT NULL;
