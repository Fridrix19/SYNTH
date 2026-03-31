CREATE TABLE "components" (
    "id" TEXT NOT NULL,
    "source_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT,
    "socket" TEXT,
    "hot" BOOLEAN NOT NULL DEFAULT false,
    "is_amd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "components_source_key_idx" ON "components"("source_key");
