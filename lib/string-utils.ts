export function getCategoryPrefix(categoryName: string): string {
  // 1. Bersihkan string (Hapus simbol, uppercase)
  const cleanName = categoryName.replace(/[^a-zA-Z\s]/g, '').toUpperCase();

  // 2. Pecah jadi array kata
  const words = cleanName.split(' ').filter((w) => w.length > 0);

  if (words.length === 0) return 'BRG'; // Default jika kosong

  // Skenario 1: 3 Kata atau lebih (Alat Tulis Kantor -> ATK)
  if (words.length >= 3) {
    return words[0][0] + words[1][0] + words[2][0];
  }

  // Skenario 2: 2 Kata (Buku Tulis -> BTU)
  // Logic: 1 huruf kata pertama + 2 huruf kata kedua
  if (words.length === 2) {
    return words[0][0] + words[1].substring(0, 2);
  }

  // Skenario 3: 1 Kata (Elektronik -> ELE)
  return cleanName.substring(0, 3);
}
