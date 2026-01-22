// Document numbering configuration
export const documentNumbering = {
  spb: {
    format: 'SPB/{year}/{number}',
    startNumber: 2132,
    numberPadding: 4, // Jumlah digit (2132 -> 2132, tapi jika < 1000 akan jadi 0001)
  },
  sppb: {
    format: 'SPPB/{year}/{number}',
    startNumber: 1,
    numberPadding: 4,
  },
  bastKeluar: {
    format: 'BAST-OUT/{year}/{number}',
    startNumber: 1,
    numberPadding: 4,
  },
  bastMasuk: {
    format: '00722::BA1.{number}',
    startNumber: 1,
    numberPadding: 5,
  },
} as const;

export type DocumentType = keyof typeof documentNumbering;
