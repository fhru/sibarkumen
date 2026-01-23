import { count, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { barang, spb, sppb, bastKeluar } from "@/drizzle/schema";

export const runtime = "nodejs";

const MODEL = "openai/gpt-oss-120b:free";
const MAX_CONTEXT_ITEMS = 50;
const apiKeys =
  process.env.OPENROUTER_API_KEYS?.split(",").map((key) => key.trim()) ??
  (process.env.OPENROUTER_API_KEY ? [process.env.OPENROUTER_API_KEY] : []);
let apiKeyIndex = 0;

function getNextApiKey() {
  if (apiKeys.length === 0) return null;
  const key = apiKeys[apiKeyIndex % apiKeys.length];
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  return key;
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

async function buildContextSummary() {
  const [
    barangList,
    spbList,
    sppbList,
    bastList,
    barangCount,
    spbCount,
    sppbCount,
    bastCount,
    stokAggregate,
  ] = await Promise.all([
    db
      .select({
        id: barang.id,
        nama: barang.nama,
        kode: barang.kodeBarang,
        stok: barang.stok,
      })
      .from(barang)
      .orderBy(desc(barang.updatedAt))
      .limit(MAX_CONTEXT_ITEMS),
    db
      .select({
        id: spb.id,
        nomor: spb.nomorSpb,
        tanggal: spb.tanggalSpb,
        status: spb.status,
      })
      .from(spb)
      .orderBy(desc(spb.id))
      .limit(MAX_CONTEXT_ITEMS),
    db
      .select({
        id: sppb.id,
        nomor: sppb.nomorSppb,
        tanggal: sppb.tanggalSppb,
        status: sppb.status,
      })
      .from(sppb)
      .orderBy(desc(sppb.id))
      .limit(MAX_CONTEXT_ITEMS),
    db
      .select({
        id: bastKeluar.id,
        nomor: bastKeluar.nomorBast,
        tanggal: bastKeluar.tanggalBast,
      })
      .from(bastKeluar)
      .orderBy(desc(bastKeluar.id))
      .limit(MAX_CONTEXT_ITEMS),
    db.select({ total: count() }).from(barang),
    db.select({ total: count() }).from(spb),
    db.select({ total: count() }).from(sppb),
    db.select({ total: count() }).from(bastKeluar),
    db
      .select({ total: sql<number>`coalesce(sum(${barang.stok}), 0)` })
      .from(barang),
  ]);

  const stats = [
    "Statistik:",
    `- Total barang: ${barangCount[0]?.total ?? 0}`,
    `- Total stok: ${stokAggregate[0]?.total ?? 0}`,
    `- Total SPB: ${spbCount[0]?.total ?? 0}`,
    `- Total SPPB: ${sppbCount[0]?.total ?? 0}`,
    `- Total BAST Keluar: ${bastCount[0]?.total ?? 0}`,
    "",
  ].join("\n");

  const summary = [
    "Ringkasan konteks data (maks 50 per kategori):",
    "",
    stats,
    "Barang/Stok:",
    ...barangList.map(
      (item) =>
        `- ${item.nama} (${item.kode}) stok=${item.stok} (id:${item.id})`,
    ),
    "",
    "SPB terbaru:",
    ...spbList.map(
      (item) =>
        `- ${item.nomor} ${formatDate(item.tanggal)} status=${item.status} (id:${item.id})`,
    ),
    "",
    "SPPB terbaru:",
    ...sppbList.map(
      (item) =>
        `- ${item.nomor} ${formatDate(item.tanggal)} status=${item.status} (id:${item.id})`,
    ),
    "",
    "BAST Keluar terbaru:",
    ...bastList.map(
      (item) => `- ${item.nomor} ${formatDate(item.tanggal)} (id:${item.id})`,
    ),
  ].join("\n");

  return summary;
}

export async function POST(req: Request) {
  const apiKey = getNextApiKey();
  if (!apiKey) {
    return new Response("Missing OPENROUTER_API_KEY(S)", { status: 500 });
  }

  const payload = await req.json();
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const contextSummary = await buildContextSummary();
  const messagesWithContext = [
    {
      role: "system",
      content:
        "Anda adalah asisten data untuk sistem Sibarkumen. " +
        "HANYA gunakan konteks data yang diberikan di bawah ini. " +
        "Jangan gunakan pengetahuan umum atau asumsi. " +
        'Jika jawaban tidak ada di konteks, jawab: "Maaf, aku belum punya informasinya." ' +
        'Jika data ambigu atau tidak lengkap, jawab: "Maaf, aku belum punya informasinya." ' +
        "Jangan menebak atau mengarang. " +
        "Jawab dalam bahasa Indonesia.",
    },
    {
      role: "system",
      content:
        "Konteks definisi:" +
        "\n- SPB: Surat Permintaan Barang." +
        "\n- SPPB: Surat Perintah Penyaluran Barang." +
        "\n- BAST: Berita Acara Serah Terima." +
        "\n- Sibarkumen: Sistem Inventaris Barang Kelurahan Ujung Menteng; dibuat oleh mahasiswa Gunadarma.",
    },
    {
      role: "system",
      content:
        "Konteks prosedur:" +
        "\n- Jika user bertanya cara pembuatan SPB: hubungi pengurus barang untuk mendaftarkan akun, login, buka halaman SPB, tekan tombol Buat SPB, isi form, kirim; tunggu sampai status selesai, lalu bisa dicetak." +
        "\n- Jika bertanya cara pembuatan SPPB/BAST: jawab bahwa hanya admin yang dapat membuatnya.",
    },
    {
      role: "system",
      content: contextSummary,
    },
    ...messages,
  ];

  const referer =
    process.env.OPENROUTER_REFERRER ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const title = process.env.OPENROUTER_TITLE || "Sibarkumen";

  const upstream = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": title,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: messagesWithContext,
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text();
    return new Response(errorText || "OpenRouter request failed", {
      status: upstream.status,
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
