-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dao_data";

-- CreateTable
CREATE TABLE "dao_data"."ProposalLikes" (
    "id" SERIAL NOT NULL,
    "proposalId" BYTEA NOT NULL,
    "userAddress" VARCHAR(42) NOT NULL,
    "likedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reaction" VARCHAR(50) NOT NULL,

    CONSTRAINT "ProposalLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_proposal_likes_proposal_id" ON "dao_data"."ProposalLikes"("proposalId");

-- CreateIndex
CREATE INDEX "idx_proposal_likes_user_address" ON "dao_data"."ProposalLikes"("userAddress");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_proposal" ON "dao_data"."ProposalLikes"("proposalId", "userAddress", "reaction");
