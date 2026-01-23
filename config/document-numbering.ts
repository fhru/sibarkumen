// Document numbering configuration
export const documentNumbering = {
  spb: {
    format: '{number}/-077/SPB/{year}',
    startNumber: 1,
    numberPadding: 0,
  },
  sppb: {
    format: '{number}/-077/SPPB/{year}',
    startNumber: 1,
    numberPadding: 0,
  },
  bastKeluar: {
    format: '{number}/-077/BAST/{year}',
    startNumber: 1,
    numberPadding: 0,
  },
  bastMasuk: {
    format: '00722::BA1.{number}',
    startNumber: 1,
    numberPadding: 5,
  },
} as const;

export type DocumentType = keyof typeof documentNumbering;
