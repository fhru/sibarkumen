/*
  Warnings:

  - You are about to drop the column `is_approved` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_approved",
DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "referensi_kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referensi_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referensi_kategori_nama_key" ON "referensi_kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "referensi_kategori_kode_key" ON "referensi_kategori"("kode");

-- CreateIndex
CREATE INDEX "barang_is_active_nama_barang_idx" ON "barang"("is_active", "nama_barang");

-- CreateIndex
CREATE INDEX "barang_kode_barang_idx" ON "barang"("kode_barang");

-- CreateIndex
CREATE INDEX "barang_kategori_idx" ON "barang"("kategori");

-- CreateIndex
CREATE INDEX "pegawai_is_active_nama_idx" ON "pegawai"("is_active", "nama");

-- CreateIndex
CREATE INDEX "pegawai_nip_idx" ON "pegawai"("nip");

-- CreateIndex
CREATE INDEX "spb_nomor_spb_idx" ON "spb"("nomor_spb");

-- CreateIndex
CREATE INDEX "spb_created_at_idx" ON "spb"("created_at");

-- CreateIndex
CREATE INDEX "sppb_nomor_sppb_idx" ON "sppb"("nomor_sppb");

-- CreateIndex
CREATE INDEX "sppb_created_at_idx" ON "sppb"("created_at");
