CREATE TYPE "public"."jenis_mutasi" AS ENUM('MASUK', 'KELUAR', 'PENYESUAIAN');--> statement-breakpoint
CREATE TYPE "public"."status_spb" AS ENUM('MENUNGGU_SPPB', 'SELESAI', 'BATAL');--> statement-breakpoint
CREATE TYPE "public"."status_sppb" AS ENUM('MENUNGGU_BAST', 'SELESAI', 'BATAL');--> statement-breakpoint
CREATE TYPE "public"."stock_opname_status" AS ENUM('DRAFT', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asal_pembelian" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "asal_pembelian_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	CONSTRAINT "asal_pembelian_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "barang" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "barang_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" varchar NOT NULL,
	"kode_barang" text NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	"spesifikasi" varchar,
	"kategori_id" integer NOT NULL,
	"satuan_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "barang_nama_unique" UNIQUE("nama"),
	CONSTRAINT "barang_kode_barang_unique" UNIQUE("kode_barang")
);
--> statement-breakpoint
CREATE TABLE "bast_keluar" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bast_keluar_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sppb_id" integer NOT NULL,
	"nomor_bast" text NOT NULL,
	"tanggal_bast" date NOT NULL,
	"pihak_pertama_id" integer NOT NULL,
	"jabatan_pihak_pertama_id" integer,
	"pihak_kedua_id" integer NOT NULL,
	"jabatan_pihak_kedua_id" integer,
	"subtotal" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_ppn" numeric(18, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"is_printed" boolean DEFAULT false NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bast_keluar_nomor_bast_unique" UNIQUE("nomor_bast")
);
--> statement-breakpoint
CREATE TABLE "bast_keluar_detail" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bast_keluar_detail_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bast_keluar_id" integer NOT NULL,
	"barang_id" integer NOT NULL,
	"qty_serah_terima" integer NOT NULL,
	"harga_satuan" numeric(18, 2) DEFAULT '0' NOT NULL,
	"persentase_ppn" integer DEFAULT 0 NOT NULL,
	"nilai_ppn" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_harga" numeric(18, 2) DEFAULT '0' NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "bast_masuk" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bast_masuk_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nomor_referensi" text NOT NULL,
	"nomor_bast" text NOT NULL,
	"tanggal_bast" date NOT NULL,
	"nomor_bapb" text NOT NULL,
	"tanggal_bapb" date NOT NULL,
	"peruntukkan" text,
	"keterangan" text,
	"asal_pembelian_id" integer NOT NULL,
	"kode_rekening_id" integer NOT NULL,
	"pihak_ketiga_id" integer NOT NULL,
	"pptk_ppk_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bast_masuk_nomor_referensi_unique" UNIQUE("nomor_referensi"),
	CONSTRAINT "bast_masuk_nomor_bast_unique" UNIQUE("nomor_bast"),
	CONSTRAINT "bast_masuk_nomor_bapb_unique" UNIQUE("nomor_bapb")
);
--> statement-breakpoint
CREATE TABLE "bast_masuk_detail" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bast_masuk_detail_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bast_masuk_id" integer NOT NULL,
	"barang_id" integer NOT NULL,
	"qty" integer NOT NULL,
	"harga_satuan" numeric(18, 2) NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jabatan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jabatan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"unit_kerja" text,
	CONSTRAINT "jabatan_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kategori_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"prefix" text NOT NULL,
	CONSTRAINT "kategori_nama_unique" UNIQUE("nama"),
	CONSTRAINT "kategori_prefix_unique" UNIQUE("prefix")
);
--> statement-breakpoint
CREATE TABLE "kode_rekening" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kode_rekening_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kode" text NOT NULL,
	"uraian" text,
	CONSTRAINT "kode_rekening_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "mutasi_barang" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mutasi_barang_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"barang_id" integer NOT NULL,
	"tanggal" timestamp DEFAULT now() NOT NULL,
	"jenis_mutasi" "jenis_mutasi" NOT NULL,
	"qty_masuk" integer DEFAULT 0 NOT NULL,
	"qty_keluar" integer DEFAULT 0 NOT NULL,
	"stok_akhir" integer NOT NULL,
	"referensi_id" text,
	"sumber_transaksi" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pegawai" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pegawai_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"nip" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pegawai_nip_unique" UNIQUE("nip"),
	CONSTRAINT "pegawai_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pegawai_jabatan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pegawai_jabatan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pegawai_id" integer NOT NULL,
	"jabatan_id" integer NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pihak_ketiga" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pihak_ketiga_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	CONSTRAINT "pihak_ketiga_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "satuan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "satuan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	CONSTRAINT "satuan_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "spb" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "spb_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nomor_spb" text NOT NULL,
	"tanggal_spb" date NOT NULL,
	"pemohon_id" integer NOT NULL,
	"jabatan_id" integer,
	"status" "status_spb" DEFAULT 'MENUNGGU_SPPB' NOT NULL,
	"is_printed" boolean DEFAULT false NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spb_nomor_spb_unique" UNIQUE("nomor_spb")
);
--> statement-breakpoint
CREATE TABLE "spb_detail" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "spb_detail_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"spb_id" integer NOT NULL,
	"barang_id" integer NOT NULL,
	"qty_permintaan" integer NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "sppb" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sppb_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nomor_sppb" text NOT NULL,
	"tanggal_sppb" date NOT NULL,
	"spb_id" integer NOT NULL,
	"pembuat_id" integer,
	"jabatan_pembuat_id" integer,
	"pejabat_penyetuju_id" integer NOT NULL,
	"jabatan_pejabat_penyetuju_id" integer,
	"serah_terima_oleh_id" integer,
	"jabatan_serah_terima_oleh_id" integer,
	"diterima_oleh_id" integer NOT NULL,
	"jabatan_diterima_oleh_id" integer,
	"keterangan" text,
	"status" "status_sppb" DEFAULT 'MENUNGGU_BAST' NOT NULL,
	"is_printed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sppb_nomor_sppb_unique" UNIQUE("nomor_sppb")
);
--> statement-breakpoint
CREATE TABLE "sppb_detail" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sppb_detail_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sppb_id" integer NOT NULL,
	"barang_id" integer NOT NULL,
	"qty_disetujui" integer NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "stock_opname" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_opname_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nomor" text NOT NULL,
	"tanggal" date NOT NULL,
	"keterangan" text,
	"status" "stock_opname_status" DEFAULT 'DRAFT' NOT NULL,
	"petugas_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_opname_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "stock_opname_detail" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_opname_detail_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stock_opname_id" integer NOT NULL,
	"barang_id" integer NOT NULL,
	"stok_sistem" integer NOT NULL,
	"stok_fisik" integer NOT NULL,
	"selisih" integer NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'petugas',
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barang" ADD CONSTRAINT "barang_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "barang" ADD CONSTRAINT "barang_satuan_id_satuan_id_fk" FOREIGN KEY ("satuan_id") REFERENCES "public"."satuan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_sppb_id_sppb_id_fk" FOREIGN KEY ("sppb_id") REFERENCES "public"."sppb"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_pihak_pertama_id_pegawai_id_fk" FOREIGN KEY ("pihak_pertama_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_jabatan_pihak_pertama_id_jabatan_id_fk" FOREIGN KEY ("jabatan_pihak_pertama_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_pihak_kedua_id_pegawai_id_fk" FOREIGN KEY ("pihak_kedua_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar" ADD CONSTRAINT "bast_keluar_jabatan_pihak_kedua_id_jabatan_id_fk" FOREIGN KEY ("jabatan_pihak_kedua_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar_detail" ADD CONSTRAINT "bast_keluar_detail_bast_keluar_id_bast_keluar_id_fk" FOREIGN KEY ("bast_keluar_id") REFERENCES "public"."bast_keluar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_keluar_detail" ADD CONSTRAINT "bast_keluar_detail_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_asal_pembelian_id_asal_pembelian_id_fk" FOREIGN KEY ("asal_pembelian_id") REFERENCES "public"."asal_pembelian"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_kode_rekening_id_kode_rekening_id_fk" FOREIGN KEY ("kode_rekening_id") REFERENCES "public"."kode_rekening"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_pihak_ketiga_id_pihak_ketiga_id_fk" FOREIGN KEY ("pihak_ketiga_id") REFERENCES "public"."pihak_ketiga"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_masuk" ADD CONSTRAINT "bast_masuk_pptk_ppk_id_pegawai_id_fk" FOREIGN KEY ("pptk_ppk_id") REFERENCES "public"."pegawai"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_masuk_detail" ADD CONSTRAINT "bast_masuk_detail_bast_masuk_id_bast_masuk_id_fk" FOREIGN KEY ("bast_masuk_id") REFERENCES "public"."bast_masuk"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bast_masuk_detail" ADD CONSTRAINT "bast_masuk_detail_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mutasi_barang" ADD CONSTRAINT "mutasi_barang_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pegawai_jabatan" ADD CONSTRAINT "pegawai_jabatan_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pegawai_jabatan" ADD CONSTRAINT "pegawai_jabatan_jabatan_id_jabatan_id_fk" FOREIGN KEY ("jabatan_id") REFERENCES "public"."jabatan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spb" ADD CONSTRAINT "spb_pemohon_id_pegawai_id_fk" FOREIGN KEY ("pemohon_id") REFERENCES "public"."pegawai"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "spb" ADD CONSTRAINT "spb_jabatan_id_jabatan_id_fk" FOREIGN KEY ("jabatan_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spb_detail" ADD CONSTRAINT "spb_detail_spb_id_spb_id_fk" FOREIGN KEY ("spb_id") REFERENCES "public"."spb"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "spb_detail" ADD CONSTRAINT "spb_detail_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_spb_id_spb_id_fk" FOREIGN KEY ("spb_id") REFERENCES "public"."spb"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_pembuat_id_pegawai_id_fk" FOREIGN KEY ("pembuat_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_jabatan_pembuat_id_jabatan_id_fk" FOREIGN KEY ("jabatan_pembuat_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_pejabat_penyetuju_id_pegawai_id_fk" FOREIGN KEY ("pejabat_penyetuju_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_jabatan_pejabat_penyetuju_id_jabatan_id_fk" FOREIGN KEY ("jabatan_pejabat_penyetuju_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_serah_terima_oleh_id_pegawai_id_fk" FOREIGN KEY ("serah_terima_oleh_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_jabatan_serah_terima_oleh_id_jabatan_id_fk" FOREIGN KEY ("jabatan_serah_terima_oleh_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_diterima_oleh_id_pegawai_id_fk" FOREIGN KEY ("diterima_oleh_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb" ADD CONSTRAINT "sppb_jabatan_diterima_oleh_id_jabatan_id_fk" FOREIGN KEY ("jabatan_diterima_oleh_id") REFERENCES "public"."jabatan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb_detail" ADD CONSTRAINT "sppb_detail_sppb_id_sppb_id_fk" FOREIGN KEY ("sppb_id") REFERENCES "public"."sppb"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sppb_detail" ADD CONSTRAINT "sppb_detail_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname" ADD CONSTRAINT "stock_opname_petugas_id_pegawai_id_fk" FOREIGN KEY ("petugas_id") REFERENCES "public"."pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname_detail" ADD CONSTRAINT "stock_opname_detail_stock_opname_id_stock_opname_id_fk" FOREIGN KEY ("stock_opname_id") REFERENCES "public"."stock_opname"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname_detail" ADD CONSTRAINT "stock_opname_detail_barang_id_barang_id_fk" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "barang_nama_idx" ON "barang" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "bast_masuk_detail_bast_idx" ON "bast_masuk_detail" USING btree ("bast_masuk_id");--> statement-breakpoint
CREATE INDEX "bast_masuk_detail_barang_idx" ON "bast_masuk_detail" USING btree ("barang_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bast_masuk_detail_bast_barang_ux" ON "bast_masuk_detail" USING btree ("bast_masuk_id","barang_id");--> statement-breakpoint
CREATE INDEX "mutasi_history_idx" ON "mutasi_barang" USING btree ("barang_id","tanggal");--> statement-breakpoint
CREATE INDEX "mutasi_barang_barang_idx" ON "mutasi_barang" USING btree ("barang_id");--> statement-breakpoint
CREATE INDEX "mutasi_barang_tanggal_idx" ON "mutasi_barang" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");