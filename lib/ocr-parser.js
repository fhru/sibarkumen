/**
 * OCR Parser untuk dokumen BAST Masuk
 * Mengekstrak data dari hasil OCR text
 * Format dokumen: BAST Kelurahan Jakarta
 */

// Mapping bulan Indonesia ke angka
const bulanMap = {
  januari: '01', februari: '02', maret: '03', april: '04',
  mei: '05', juni: '06', juli: '07', agustus: '08',
  september: '09', oktober: '10', november: '11', desember: '12'
};

const bulanPattern = 'januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember';

// Pattern regex untuk ekstraksi data
const patterns = {
  // Nomor BAST: "Nomor : 538/PN.01.02/BASTHP/KEL.UM/2025"
  nomorBast: /Nomor\s*:\s*([A-Z0-9\-\/\.]+)/i,
  
  // Tanggal format: "tanggal 26 bulan September tahun 2025" atau "Jum'at tanggal 26 bulan September tahun 2025"
  tanggalBulanTahun: new RegExp(`tanggal\\s+(\\d{1,2})\\s+bulan\\s+(${bulanPattern})\\s+tahun\\s+(\\d{4})`, 'i'),
  
  // Tanggal format sederhana: "26 September 2025" atau "26-09-2025"
  tanggalSederhana: new RegExp(`(\\d{1,2})\\s+(${bulanPattern})\\s+(\\d{4})|(\\d{1,2})\\s*[-\\/]\\s*(\\d{1,2})\\s*[-\\/]\\s*(\\d{4})`, 'gi'),
  
  // Nomor BAPB: "Berita Acara Pemeriksaan Barang Nomor. 538/PN.01.02/BASTHP/KEL.UM/2025"
  nomorBapb: /Berita\s+Acara\s+Pemeriksaan\s+Barang\s+Nomor\.?\s*([A-Z0-9\-\/\.]+)/i,
  
  // Tanggal BAPB: setelah nomor BAPB "tanggal 26 bulan September tahun 2025"
  tanggalBapb: new RegExp(`Berita\\s+Acara\\s+Pemeriksaan\\s+Barang\\s+Nomor\\.?\\s*[A-Z0-9\\-\\/\\.]+\\s+tanggal\\s+(\\d{1,2})\\s+bulan\\s+(${bulanPattern})\\s+tahun\\s+(\\d{4})`, 'i'),
  
  // Pihak ketiga: CV, PT, Toko, UD (dengan nama lengkap)
  pihakKetiga: /(?:cv|pt|toko|ud)\.?\s+([a-zA-Z0-9\s]+?)(?:\s+sesuai|\s+sebagai|\s+untuk|\n|,|;|$)/gi,
  
  // Harga dengan format Rp atau angka dengan titik/koma
  harga: /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
  
  // Jumlah/Volume dengan satuan
  jumlah: /(\d+)\s*(?:unit|pcs|buah|lembar|rim|set|pack|dus|box|kg|liter|meter)/gi,
};

/**
 * Parse tanggal format "tanggal X bulan Y tahun Z" ke YYYY-MM-DD
 */
function parseTanggalBulanTahun(text) {
  const match = text.match(patterns.tanggalBulanTahun);
  if (match) {
    const [, day, bulan, year] = match;
    const month = bulanMap[bulan.toLowerCase()];
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  return null;
}

/**
 * Parse tanggal dari berbagai format ke YYYY-MM-DD
 */
function parseTanggal(text) {
  // Coba format "tanggal X bulan Y tahun Z" dulu
  const tanggalBulanTahun = parseTanggalBulanTahun(text);
  if (tanggalBulanTahun) return tanggalBulanTahun;
  
  // Fallback ke format sederhana
  const matches = text.match(patterns.tanggalSederhana);
  if (!matches || matches.length === 0) return null;
  
  const match = matches[0];
  
  // Format: DD-MM-YYYY atau DD/MM/YYYY
  const numericMatch = match.match(/(\d{1,2})\s*[-\/]\s*(\d{1,2})\s*[-\/]\s*(\d{4})/);
  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Format: DD Bulan YYYY
  const bulanRegex = new RegExp(`(\\d{1,2})\\s+(${bulanPattern})\\s+(\\d{4})`, 'i');
  const textMatch = match.match(bulanRegex);
  if (textMatch) {
    const [, day, bulan, year] = textMatch;
    const month = bulanMap[bulan.toLowerCase()];
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  
  return null;
}

/**
 * Parse nomor BAST
 */
function parseNomorBast(text) {
  const match = text.match(patterns.nomorBast);
  return match ? match[1].trim() : null;
}

/**
 * Parse nomor BAPB (Berita Acara Pemeriksaan Barang)
 */
function parseNomorBapb(text) {
  const match = text.match(patterns.nomorBapb);
  return match ? match[1].trim() : null;
}

/**
 * Parse tanggal BAPB
 */
function parseTanggalBapb(text) {
  const match = text.match(patterns.tanggalBapb);
  if (match) {
    const [, day, bulan, year] = match;
    const month = bulanMap[bulan.toLowerCase()];
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  return null;
}

/**
 * Parse pihak ketiga (vendor)
 */
function parsePihakKetiga(text) {
  const matches = [...text.matchAll(patterns.pihakKetiga)];
  if (matches.length === 0) return null;
  
  // Ambil yang pertama dan bersihkan
  const vendor = matches[0][0].trim();
  return vendor.replace(/[,;.]$/, '').trim();
}

/**
 * Parse daftar barang dari teks
 * Mencoba mencocokkan dengan database barang
 */
function parseBarang(text, barangOptions = []) {
  const lines = text.split('\n');
  const items = [];
  
  for (const line of lines) {
    // Skip baris kosong atau header
    if (!line.trim() || line.toLowerCase().includes('nama barang') || line.toLowerCase().includes('uraian')) {
      continue;
    }
    
    // Cari jumlah dalam baris
    const jumlahMatch = line.match(/(\d+)\s*(?:unit|pcs|buah|lembar|rim|set|pack|dus|box|kg|liter|meter)?/i);
    
    // Cari harga dalam baris (angka besar, biasanya > 1000)
    const hargaMatches = [...line.matchAll(/(\d{1,3}(?:[.,]\d{3})+|\d{4,})/g)];
    
    if (jumlahMatch || hargaMatches.length > 0) {
      // Coba cocokkan dengan barang di database
      let matchedBarang = null;
      let highestScore = 0;
      
      for (const barang of barangOptions) {
        const score = calculateSimilarity(line.toLowerCase(), barang.namaBarang.toLowerCase());
        if (score > highestScore && score > 0.3) {
          highestScore = score;
          matchedBarang = barang;
        }
      }
      
      if (matchedBarang || jumlahMatch) {
        const jumlah = jumlahMatch ? parseInt(jumlahMatch[1]) : 1;
        let harga = 0;
        
        if (hargaMatches.length > 0) {
          // Ambil angka terbesar sebagai harga (biasanya total atau harga satuan)
          const angkaList = hargaMatches.map(m => {
            const num = m[1].replace(/[.,]/g, '');
            return parseInt(num);
          });
          // Jika ada 2 angka, yang lebih kecil kemungkinan harga satuan
          if (angkaList.length >= 2) {
            harga = Math.min(...angkaList.filter(n => n > 100));
          } else {
            harga = angkaList[0];
          }
        }
        
        items.push({
          idBarang: matchedBarang ? String(matchedBarang.id) : '',
          namaBarang: matchedBarang ? matchedBarang.namaBarang : line.substring(0, 50),
          jumlah: jumlah,
          hargaSatuan: harga,
          totalHarga: jumlah * harga,
          confidence: highestScore,
          rawText: line.trim()
        });
      }
    }
  }
  
  return items;
}

/**
 * Hitung similarity score antara dua string (simple Jaccard-like)
 */
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return intersection / union;
}

/**
 * Main parser function - ekstrak semua data dari OCR text
 */
export function parseOcrText(text, barangOptions = []) {
  const result = {
    nomorBast: parseNomorBast(text),
    tanggalBast: parseTanggal(text),
    nomorBapb: parseNomorBapb(text),
    tanggalBapb: parseTanggalBapb(text),
    pihakKetiga: parsePihakKetiga(text),
    details: parseBarang(text, barangOptions),
    rawText: text,
    confidence: 0
  };
  
  // Jika tanggal BAPB tidak ditemukan, gunakan tanggal BAST
  if (!result.tanggalBapb && result.tanggalBast) {
    result.tanggalBapb = result.tanggalBast;
  }
  
  // Hitung confidence score keseluruhan
  let filledFields = 0;
  if (result.nomorBast) filledFields++;
  if (result.tanggalBast) filledFields++;
  if (result.nomorBapb) filledFields++;
  if (result.tanggalBapb) filledFields++;
  if (result.pihakKetiga) filledFields++;
  if (result.details.length > 0) filledFields++;
  
  result.confidence = filledFields / 6;
  
  return result;
}

/**
 * Format hasil parsing untuk ditampilkan ke user
 */
export function formatParseResult(result) {
  return {
    header: {
      nomorBast: result.nomorBast || '-',
      tanggalBast: result.tanggalBast || '-',
      nomorBapb: result.nomorBapb || '-',
      tanggalBapb: result.tanggalBapb || '-',
      pihakKetiga: result.pihakKetiga || '-',
    },
    items: result.details.map((item, idx) => ({
      no: idx + 1,
      namaBarang: item.namaBarang,
      jumlah: item.jumlah,
      hargaSatuan: item.hargaSatuan,
      totalHarga: item.totalHarga,
      matched: item.idBarang !== '',
      confidence: Math.round(item.confidence * 100)
    })),
    overallConfidence: Math.round(result.confidence * 100)
  };
}
