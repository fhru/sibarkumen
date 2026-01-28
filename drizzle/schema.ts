import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  date,
  integer,
  pgEnum,
  numeric,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("petugas"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const barang = pgTable(
  "barang",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nama: varchar("nama").notNull().unique(),
    kodeBarang: text("kode_barang").notNull().unique(),
    stok: integer("stok").default(0).notNull(),
    spesifikasi: varchar("spesifikasi"),

    kategoriId: integer("kategori_id")
      .notNull()
      .references(() => kategori.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    // satuanId ini adalah SATUAN TERKECIL (misal: Pcs)
    satuanId: integer("satuan_id")
      .notNull()
      .references(() => satuan.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("barang_nama_idx").on(table.nama)],
);

export const pihakKetiga = pgTable("pihak_ketiga", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull().unique(),
});

export const kategori = pgTable("kategori", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull().unique(),
  prefix: text("prefix").notNull().unique(),
});

export const satuan = pgTable("satuan", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull().unique(),
});

export const asalPembelian = pgTable("asal_pembelian", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull().unique(),
});

export const kodeRekening = pgTable("kode_rekening", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  kode: text("kode").notNull().unique(),
  uraian: text("uraian"),
});

export const jabatan = pgTable("jabatan", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull().unique(),
  unitKerja: text("unit_kerja"),
});

export const pegawai = pgTable("pegawai", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: text("nama").notNull(),
  nip: text("nip").unique(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" })
    .unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const pegawaiJabatan = pgTable("pegawai_jabatan", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pegawaiId: integer("pegawai_id")
    .notNull()
    .references(() => pegawai.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  jabatanId: integer("jabatan_id")
    .notNull()
    .references(() => jabatan.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isAktif: boolean("is_aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const bastMasuk = pgTable("bast_masuk", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nomorReferensi: text("nomor_referensi").notNull().unique(),
  nomorBast: text("nomor_bast").notNull().unique(),
  tanggalBast: date("tanggal_bast").notNull(),
  nomorBapb: text("nomor_bapb").notNull().unique(),
  tanggalBapb: date("tanggal_bapb").notNull(),
  peruntukkan: text("peruntukkan"),
  keterangan: text("keterangan"),
  asalPembelianId: integer("asal_pembelian_id")
    .notNull()
    .references(() => asalPembelian.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  kodeRekeningId: integer("kode_rekening_id")
    .notNull()
    .references(() => kodeRekening.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  pihakKetigaId: integer("pihak_ketiga_id")
    .notNull()
    .references(() => pihakKetiga.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  pptkPpkId: integer("pptk_ppk_id")
    .notNull()
    .references(() => pegawai.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const bastMasukDetail = pgTable(
  "bast_masuk_detail",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    bastMasukId: integer("bast_masuk_id")
      .notNull()
      .references(() => bastMasuk.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    barangId: integer("barang_id")
      .notNull()
      .references(() => barang.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    // Qty Masuk (1:1 dengan satuan barang)
    qty: integer("qty").notNull(),

    hargaSatuan: numeric("harga_satuan", { precision: 18, scale: 2 }).notNull(),
    keterangan: text("keterangan"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("bast_masuk_detail_bast_idx").on(t.bastMasukId),
    index("bast_masuk_detail_barang_idx").on(t.barangId),
    uniqueIndex("bast_masuk_detail_bast_barang_ux").on(
      t.bastMasukId,
      t.barangId,
    ),
  ],
);

export const jenisMutasiEnum = pgEnum("jenis_mutasi", [
  "MASUK",
  "KELUAR",
  "PENYESUAIAN",
]);

export const mutasiBarang = pgTable(
  "mutasi_barang",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    // Barang apa yang dimutasi
    barangId: integer("barang_id")
      .notNull()
      .references(() => barang.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    // Kapan mutasi terjadi (bisa beda dengan created_at, misal input data mundur)
    tanggal: timestamp("tanggal").notNull().defaultNow(),

    // Jenis: MASUK (dari BAST), KELUAR (dipakai), atau PENYESUAIAN (Stock Opname)
    jenisMutasi: jenisMutasiEnum("jenis_mutasi").notNull(),

    // Agar lebih mudah di-sum, pisahkan kolom masuk dan keluar
    qtyMasuk: integer("qty_masuk").default(0).notNull(),
    qtyKeluar: integer("qty_keluar").default(0).notNull(),

    // PENTING: Stok akhir setelah transaksi ini terjadi (Snapshot)
    stokAkhir: integer("stok_akhir").notNull(),

    // Untuk melacak sumber transaksi (misal: "BAST-IN-001" atau ID table lain)
    referensiId: text("referensi_id"), // Bisa diisi Nomor BAST / ID Transaksi
    sumberTransaksi: text("sumber_transaksi"), // Contoh: 'BAST_MASUK', 'PEMAKAIAN', 'STOCK_OPNAME'

    keterangan: text("keterangan"),

    // Audit trail
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("mutasi_history_idx").on(table.barangId, table.tanggal),
    index("mutasi_barang_barang_idx").on(table.barangId),
    index("mutasi_barang_tanggal_idx").on(table.tanggal),
  ],
);

export const statusSpbEnum = pgEnum("status_spb", [
  "MENUNGGU_SPPB",
  "SELESAI",
  "BATAL",
]);

export const statusSppbEnum = pgEnum("status_sppb", [
  "MENUNGGU_BAST",
  "SELESAI",
  "BATAL",
]);

// Tabel Header SPB (Surat permintaan Barang)
export const spb = pgTable("spb", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nomorSpb: text("nomor_spb").notNull().unique(),
  tanggalSpb: date("tanggal_spb").notNull(),

  // Relasi ke Pegawai (Pemohon)
  pemohonId: integer("pemohon_id")
    .notNull()
    .references(() => pegawai.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  // Relasi ke Jabatan (Nullable, karena diambil dari pemohon)
  jabatanId: integer("jabatan_id").references(() => jabatan.id, {
    onDelete: "set null",
  }),

  status: statusSpbEnum("status").default("MENUNGGU_SPPB").notNull(),
  isPrinted: boolean("is_printed").default(false).notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tabel Detail SPB (Item yang diminta)
export const spbDetail = pgTable("spb_detail", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  spbId: integer("spb_id")
    .notNull()
    .references(() => spb.id, { onDelete: "cascade", onUpdate: "cascade" }),

  barangId: integer("barang_id")
    .notNull()
    .references(() => barang.id),

  qtyPermintaan: integer("qty_permintaan").notNull(),
  keterangan: text("keterangan"),
});

// Header SPPB
export const sppb = pgTable("sppb", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  nomorSppb: text("nomor_sppb").notNull().unique(),
  tanggalSppb: date("tanggal_sppb").notNull(),

  spbId: integer("spb_id")
    .notNull()
    .references(() => spb.id, { onDelete: "cascade" }),

  // Pihak-pihak yang bertanda tangan
  pembuatId: integer("pembuat_id") // Admin/Staff Gudang yang input
    .references(() => pegawai.id),
  jabatanPembuatId: integer("jabatan_pembuat_id").references(() => jabatan.id, {
    onDelete: "set null",
  }),

  pejabatPenyetujuId: integer("pejabat_penyetuju_id") // Kepala Bagian/PPK yang menyetujui
    .notNull()
    .references(() => pegawai.id),
  jabatanPejabatPenyetujuId: integer("jabatan_pejabat_penyetuju_id").references(
    () => jabatan.id,
    { onDelete: "set null" },
  ),

  serahTerimaOlehId: integer("serah_terima_oleh_id") // Petugas Gudang yang menyerahkan fisik
    .references(() => pegawai.id),
  jabatanSerahTerimaOlehId: integer("jabatan_serah_terima_oleh_id").references(
    () => jabatan.id,
    { onDelete: "set null" },
  ),

  diterimaOlehId: integer("diterima_oleh_id") // User yang mengambil barang
    .notNull()
    .references(() => pegawai.id),
  jabatanDiterimaOlehId: integer("jabatan_diterima_oleh_id").references(
    () => jabatan.id,
    { onDelete: "set null" },
  ),

  keterangan: text("keterangan"),
  status: statusSppbEnum("status").default("MENUNGGU_BAST").notNull(),
  isPrinted: boolean("is_printed").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Detail Barang yang DISETUJUI untuk keluar
export const sppbDetail = pgTable("sppb_detail", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  sppbId: integer("sppb_id")
    .notNull()
    .references(() => sppb.id, { onDelete: "cascade" }),

  barangId: integer("barang_id")
    .notNull()
    .references(() => barang.id),

  // Jumlah yang disetujui untuk dikeluarkan saat ini
  qtyDisetujui: integer("qty_disetujui").notNull(),
  keterangan: text("keterangan"),
});

export const bastKeluar = pgTable("bast_keluar", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  // Referensi ke SPPB (Wajib, karena BAST dasarnya adalah SPPB)
  sppbId: integer("sppb_id")
    .notNull()
    .references(() => sppb.id, { onDelete: "cascade" }),

  nomorBast: text("nomor_bast").notNull().unique(),
  tanggalBast: date("tanggal_bast").notNull(), // Tanggal tanda tangan (Serah Terima)

  // Pihak yang bertanda tangan (Biasanya Pihak 1 & Pihak 2)
  pihakPertamaId: integer("pihak_pertama_id") // Yang Menyerahkan (Gudang/Pejabat Aset)
    .notNull()
    .references(() => pegawai.id),
  jabatanPihakPertamaId: integer("jabatan_pihak_pertama_id").references(
    () => jabatan.id,
    {
      onDelete: "set null",
    },
  ),

  pihakKeduaId: integer("pihak_kedua_id") // Yang Menerima (User/Pemohon)
    .notNull()
    .references(() => pegawai.id),
  jabatanPihakKeduaId: integer("jabatan_pihak_kedua_id").references(
    () => jabatan.id,
    {
      onDelete: "set null",
    },
  ),

  // Jumlah total harga dasar semua item (Sebelum PPN)
  subtotal: numeric("subtotal", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),

  // Total PPN dari semua item (Sum of bastKeluarDetail.nilaiPpn)
  totalPpn: numeric("total_ppn", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),

  // Grand Total yang harus dibayar/dicatat (Subtotal + Total PPN)
  grandTotal: numeric("grand_total", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),

  isPrinted: boolean("is_printed").default(false).notNull(),

  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const bastKeluarDetail = pgTable("bast_keluar_detail", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  bastKeluarId: integer("bast_keluar_id")
    .notNull()
    .references(() => bastKeluar.id, { onDelete: "cascade" }),

  barangId: integer("barang_id")
    .notNull()
    .references(() => barang.id),

  qtySerahTerima: integer("qty_serah_terima").notNull(),

  hargaSatuan: numeric("harga_satuan", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),

  persentasePpn: integer("persentase_ppn").default(0).notNull(),

  nilaiPpn: numeric("nilai_ppn", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),

  totalHarga: numeric("total_harga", { precision: 18, scale: 2 })
    .default("0")
    .notNull(),
  keterangan: text("keterangan"),
});

// Relasi Header BAST Keluar
export const bastKeluarRelations = relations(bastKeluar, ({ one, many }) => ({
  sppb: one(sppb, {
    fields: [bastKeluar.sppbId],
    references: [sppb.id],
  }),
  pihakPertama: one(pegawai, {
    fields: [bastKeluar.pihakPertamaId],
    references: [pegawai.id],
    relationName: "bastKeluarPihakPertama",
  }),
  pihakKedua: one(pegawai, {
    fields: [bastKeluar.pihakKeduaId],
    references: [pegawai.id],
    relationName: "bastKeluarPihakKedua",
  }),
  jabatanPihakPertama: one(jabatan, {
    fields: [bastKeluar.jabatanPihakPertamaId],
    references: [jabatan.id],
    relationName: "bastKeluarJabatanPihakPertama",
  }),
  jabatanPihakKedua: one(jabatan, {
    fields: [bastKeluar.jabatanPihakKeduaId],
    references: [jabatan.id],
    relationName: "bastKeluarJabatanPihakKedua",
  }),
  items: many(bastKeluarDetail),
}));

// Relasi Detail BAST Keluar
export const bastKeluarDetailRelations = relations(
  bastKeluarDetail,
  ({ one }) => ({
    bastKeluar: one(bastKeluar, {
      fields: [bastKeluarDetail.bastKeluarId],
      references: [bastKeluar.id],
    }),
    barang: one(barang, {
      fields: [bastKeluarDetail.barangId],
      references: [barang.id],
    }),
  }),
);

export const sppbRelations = relations(sppb, ({ one, many }) => ({
  spb: one(spb, {
    fields: [sppb.spbId],
    references: [spb.id],
  }),
  pembuat: one(pegawai, {
    fields: [sppb.pembuatId],
    references: [pegawai.id],
    relationName: "sppbPembuat",
  }),
  pejabatPenyetuju: one(pegawai, {
    fields: [sppb.pejabatPenyetujuId],
    references: [pegawai.id],
    relationName: "sppbPenyetuju",
  }),
  serahTerimaOleh: one(pegawai, {
    fields: [sppb.serahTerimaOlehId],
    references: [pegawai.id],
    relationName: "sppbSerahTerima",
  }),
  diterimaOleh: one(pegawai, {
    fields: [sppb.diterimaOlehId],
    references: [pegawai.id],
    relationName: "sppbPenerima",
  }),
  jabatanPembuat: one(jabatan, {
    fields: [sppb.jabatanPembuatId],
    references: [jabatan.id],
    relationName: "sppbJabatanPembuat",
  }),
  jabatanPejabatPenyetuju: one(jabatan, {
    fields: [sppb.jabatanPejabatPenyetujuId],
    references: [jabatan.id],
    relationName: "sppbJabatanPejabatPenyetuju",
  }),
  jabatanSerahTerimaOleh: one(jabatan, {
    fields: [sppb.jabatanSerahTerimaOlehId],
    references: [jabatan.id],
    relationName: "sppbJabatanSerahTerimaOleh",
  }),
  jabatanDiterimaOleh: one(jabatan, {
    fields: [sppb.jabatanDiterimaOlehId],
    references: [jabatan.id],
    relationName: "sppbJabatanDiterimaOleh",
  }),
  items: many(sppbDetail),
  bastKeluarList: many(bastKeluar),
}));

export const sppbDetailRelations = relations(sppbDetail, ({ one }) => ({
  sppb: one(sppb, {
    fields: [sppbDetail.sppbId],
    references: [sppb.id],
  }),
  barang: one(barang, {
    fields: [sppbDetail.barangId],
    references: [barang.id],
  }),
}));

export const spbRelations = relations(spb, ({ one, many }) => ({
  pemohon: one(pegawai, {
    fields: [spb.pemohonId],
    references: [pegawai.id],
    relationName: "spbPemohon",
  }),
  jabatan: one(jabatan, {
    fields: [spb.jabatanId],
    references: [jabatan.id],
  }),
  items: many(spbDetail),
  sppbList: many(sppb),
}));

export const spbDetailRelations = relations(spbDetail, ({ one }) => ({
  spb: one(spb, {
    fields: [spbDetail.spbId],
    references: [spb.id],
  }),
  barang: one(barang, {
    fields: [spbDetail.barangId],
    references: [barang.id],
  }),
}));

export const mutasiBarangRelations = relations(mutasiBarang, ({ one }) => ({
  barang: one(barang, {
    fields: [mutasiBarang.barangId],
    references: [barang.id],
  }),
}));

export const bastMasukRelations = relations(bastMasuk, ({ one, many }) => ({
  asalPembelian: one(asalPembelian, {
    fields: [bastMasuk.asalPembelianId],
    references: [asalPembelian.id],
  }),
  kodeRekening: one(kodeRekening, {
    fields: [bastMasuk.kodeRekeningId],
    references: [kodeRekening.id],
  }),
  pihakKetiga: one(pihakKetiga, {
    fields: [bastMasuk.pihakKetigaId],
    references: [pihakKetiga.id],
  }),
  pptkPpk: one(pegawai, {
    fields: [bastMasuk.pptkPpkId],
    references: [pegawai.id],
  }),
  items: many(bastMasukDetail),
}));

export const bastMasukDetailRelations = relations(
  bastMasukDetail,
  ({ one }) => ({
    bastMasuk: one(bastMasuk, {
      fields: [bastMasukDetail.bastMasukId],
      references: [bastMasuk.id],
    }),
    barang: one(barang, {
      fields: [bastMasukDetail.barangId],
      references: [barang.id],
    }),
  }),
);

export const barangRelations = relations(barang, ({ one, many }) => ({
  kategori: one(kategori, {
    fields: [barang.kategoriId],
    references: [kategori.id],
  }),
  satuan: one(satuan, {
    fields: [barang.satuanId],
    references: [satuan.id],
  }),
  bastMasukItems: many(bastMasukDetail),
  mutasi: many(mutasiBarang),
}));

export const pegawaiRelations = relations(pegawai, ({ one, many }) => ({
  akun: one(user, {
    fields: [pegawai.userId],
    references: [user.id],
  }),
  pegawaiJabatan: many(pegawaiJabatan),
  bastMasukSebagaiPptkPpk: many(bastMasuk),
  spbPermohonan: many(spb, { relationName: "spbPemohon" }),
  bastKeluarPihakPertama: many(bastKeluar, {
    relationName: "bastKeluarPihakPertama",
  }),
  bastKeluarPihakKedua: many(bastKeluar, {
    relationName: "bastKeluarPihakKedua",
  }),
}));

export const jabatanRelations = relations(jabatan, ({ many }) => ({
  pegawaiJabatan: many(pegawaiJabatan),
}));

export const pegawaiJabatanRelations = relations(pegawaiJabatan, ({ one }) => ({
  pegawai: one(pegawai, {
    fields: [pegawaiJabatan.pegawaiId],
    references: [pegawai.id],
  }),
  jabatan: one(jabatan, {
    fields: [pegawaiJabatan.jabatanId],
    references: [jabatan.id],
  }),
}));

export const kodeRekeningRelations = relations(kodeRekening, ({ many }) => ({
  bastMasuk: many(bastMasuk),
}));

export const pihakKetigaRelations = relations(pihakKetiga, ({ many }) => ({
  bastMasuk: many(bastMasuk),
}));

export const kategoriRelations = relations(kategori, ({ many }) => ({
  barang: many(barang),
}));

export const satuanRelations = relations(satuan, ({ many }) => ({
  barang: many(barang),
}));

export const asalPembelianRelations = relations(asalPembelian, ({ many }) => ({
  bastMasuk: many(bastMasuk),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),

  // Relasi ke Data Pegawai
  dataPegawai: one(pegawai, {
    fields: [user.id],
    references: [pegawai.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const stockOpnameStatusEnum = pgEnum("stock_opname_status", [
  "DRAFT",
  "COMPLETED",
  "CANCELLED",
]);

export const stockOpname = pgTable("stock_opname", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nomor: text("nomor").notNull().unique(), // e.g., SO/2024/001
  tanggal: date("tanggal").notNull(),
  keterangan: text("keterangan"),
  status: stockOpnameStatusEnum("status").default("DRAFT").notNull(),
  petugasId: integer("petugas_id").references(() => pegawai.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockOpnameDetail = pgTable("stock_opname_detail", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  stockOpnameId: integer("stock_opname_id")
    .references(() => stockOpname.id, { onDelete: "cascade" })
    .notNull(),
  barangId: integer("barang_id")
    .references(() => barang.id)
    .notNull(),
  stokSistem: integer("stok_sistem").notNull(), // Snapshot
  stokFisik: integer("stok_fisik").notNull(), // User Input
  selisih: integer("selisih").notNull(), // Computed
  keterangan: text("keterangan"),
});

export const stockOpnameRelations = relations(stockOpname, ({ one, many }) => ({
  petugas: one(pegawai, {
    fields: [stockOpname.petugasId],
    references: [pegawai.id],
  }),
  items: many(stockOpnameDetail),
}));

export const stockOpnameDetailRelations = relations(
  stockOpnameDetail,
  ({ one }) => ({
    stockOpname: one(stockOpname, {
      fields: [stockOpnameDetail.stockOpnameId],
      references: [stockOpname.id],
    }),
    barang: one(barang, {
      fields: [stockOpnameDetail.barangId],
      references: [barang.id],
    }),
  }),
);
