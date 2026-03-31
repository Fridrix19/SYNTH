CREATE TABLE "ready_builds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT,
    "cpu" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "ram" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "cooling" TEXT NOT NULL,
    "badge" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "home_order" INTEGER,

    CONSTRAINT "ready_builds_pkey" PRIMARY KEY ("id")
);
