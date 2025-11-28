-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMPTZ,
    "failed_login_attempts" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id" SERIAL NOT NULL,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "spesifikasi" TEXT,
    "asal_pembelian" TEXT NOT NULL,
    "stok_tersedia" INTEGER NOT NULL DEFAULT 0,
    "stok_minimum" INTEGER NOT NULL DEFAULT 0,
    "harga_satuan" DECIMAL(19,2) NOT NULL,
    "total_harga" DECIMAL(19,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekening" (
    "id" SERIAL NOT NULL,
    "nama_bank" TEXT NOT NULL,
    "kode_bank" TEXT NOT NULL,
    "nomor_rekening" TEXT NOT NULL,
    "nama_pemilik" TEXT NOT NULL,
    "jenis_rekening" TEXT NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "rekening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pegawai" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "unit_kerja" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pejabat_pengelola" (
    "id" SERIAL NOT NULL,
    "id_pegawai" INTEGER NOT NULL,
    "jenis_jabatan" TEXT NOT NULL,
    "nomor_sk" TEXT NOT NULL,
    "tanggal_sk" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "pejabat_pengelola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bast_masuk" (
    "id" SERIAL NOT NULL,
    "nomor_referensi" TEXT NOT NULL,
    "nomor_bast" TEXT NOT NULL,
    "tanggal_bast" DATE NOT NULL,
    "nomor_bapb" TEXT NOT NULL,
    "tanggal_bapb" DATE NOT NULL,
    "asal_pembelian" TEXT NOT NULL,
    "peruntukkan" TEXT,
    "id_rekening" INTEGER NOT NULL,
    "pihak_ketiga" TEXT,
    "keterangan" TEXT,
    "pptk_ppk" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bast_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bast_masuk_detail" (
    "id" SERIAL NOT NULL,
    "id_bast_masuk" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(19,2) NOT NULL,
    "total_harga" DECIMAL(19,2) NOT NULL,

    CONSTRAINT "bast_masuk_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spb" (
    "id" SERIAL NOT NULL,
    "nomor_spb" TEXT NOT NULL,
    "tanggal_spb" DATE NOT NULL,
    "pemohon" INTEGER NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "spb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spb_detail" (
    "id" SERIAL NOT NULL,
    "id_spb" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "spb_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppb" (
    "id" SERIAL NOT NULL,
    "nomor_sppb" TEXT NOT NULL,
    "tanggal_sppb" DATE NOT NULL,
    "id_spb" INTEGER NOT NULL,
    "id_pejabat_penatausahaan" INTEGER NOT NULL,
    "id_pengelola_barang" INTEGER NOT NULL,
    "id_penerima" INTEGER NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sppb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppb_detail" (
    "id" SERIAL NOT NULL,
    "id_sppb" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jumlah_disalurkan" INTEGER NOT NULL,

    CONSTRAINT "sppb_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bast_keluar" (
    "id" SERIAL NOT NULL,
    "nomor_bast" TEXT NOT NULL,
    "tanggal_bast" DATE NOT NULL,
    "id_sppb" INTEGER NOT NULL,
    "id_pihak_menyerahkan" INTEGER NOT NULL,
    "id_pihak_menerima" INTEGER NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bast_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bast_keluar_detail" (
    "id" SERIAL NOT NULL,
    "id_bast" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "volume" DECIMAL(19,2) NOT NULL,
    "jumlah_harga" DECIMAL(19,2) NOT NULL,
    "ppn" DECIMAL(19,2) NOT NULL,
    "harga_setelah_ppn" DECIMAL(19,2) NOT NULL,

    CONSTRAINT "bast_keluar_detail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pejabat_pengelola" ADD CONSTRAINT "pejabat_pengelola_id_pegawai_fkey" FOREIGN KEY ("id_pegawai") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_id_rekening_fkey" FOREIGN KEY ("id_rekening") REFERENCES "rekening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_pptk_ppk_fkey" FOREIGN KEY ("pptk_ppk") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_masuk_detail" ADD CONSTRAINT "bast_masuk_detail_id_bast_masuk_fkey" FOREIGN KEY ("id_bast_masuk") REFERENCES "bast_masuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_masuk_detail" ADD CONSTRAINT "bast_masuk_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spb" ADD CONSTRAINT "spb_pemohon_fkey" FOREIGN KEY ("pemohon") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spb_detail" ADD CONSTRAINT "spb_detail_id_spb_fkey" FOREIGN KEY ("id_spb") REFERENCES "spb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spb_detail" ADD CONSTRAINT "spb_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_id_spb_fkey" FOREIGN KEY ("id_spb") REFERENCES "spb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_id_pejabat_penatausahaan_fkey" FOREIGN KEY ("id_pejabat_penatausahaan") REFERENCES "pejabat_pengelola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_id_pengelola_barang_fkey" FOREIGN KEY ("id_pengelola_barang") REFERENCES "pejabat_pengelola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_id_penerima_fkey" FOREIGN KEY ("id_penerima") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb_detail" ADD CONSTRAINT "sppb_detail_id_sppb_fkey" FOREIGN KEY ("id_sppb") REFERENCES "sppb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppb_detail" ADD CONSTRAINT "sppb_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_id_sppb_fkey" FOREIGN KEY ("id_sppb") REFERENCES "sppb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_id_pihak_menyerahkan_fkey" FOREIGN KEY ("id_pihak_menyerahkan") REFERENCES "pejabat_pengelola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_id_pihak_menerima_fkey" FOREIGN KEY ("id_pihak_menerima") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_keluar_detail" ADD CONSTRAINT "bast_keluar_detail_id_bast_fkey" FOREIGN KEY ("id_bast") REFERENCES "bast_keluar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bast_keluar_detail" ADD CONSTRAINT "bast_keluar_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
