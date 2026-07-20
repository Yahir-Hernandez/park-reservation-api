-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('cliente', 'administrador');

-- CreateEnum
CREATE TYPE "visit_type" AS ENUM ('cabaña', 'camping');

-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('activa', 'cancelada');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'cliente',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "park" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "services" VARCHAR(50)[],
    "opening_time" TIME NOT NULL,
    "closing_time" TIME NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "start_season" DATE NOT NULL,
    "end_season" DATE NOT NULL,
    "close_days" VARCHAR(15)[],
    "has_cabins" BOOLEAN NOT NULL DEFAULT false,
    "capacity_camping" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "park_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "park_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "park_id" INTEGER NOT NULL,
    "cabin_id" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "people" SMALLINT NOT NULL,
    "visit_type" "visit_type" NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'activa',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "park"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "park"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
