-- CreateTable
CREATE TABLE "dao_data"."BuilderProfiles" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "image" VARCHAR(500),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuilderProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_builder_profile_address" ON "dao_data"."BuilderProfiles"("address");
