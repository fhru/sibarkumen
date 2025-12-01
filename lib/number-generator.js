import prisma from '@/lib/prisma';

export async function generateDocumentNumber(prefix, modelName, dateField = 'createdAt') {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const romanMonth = toRoman(month);

  // Find the last document created in the current year
  // We rely on the string pattern or a separate sequence. 
  // For simplicity, let's query the last one that matches the pattern /{year}$/
  // Or simply get the very last record created this year.
  
  // Using prisma raw query or finding last record could be tricky if the format wasn't consistent.
  // Assuming we start consistent from now.
  
  // Let's fetch the last record ordered by ID or specific date field
  // Ideally we should filter by year.
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  // Dynamic model access
  const model = prisma[modelName];
  if (!model) throw new Error(`Model ${modelName} not found`);

  // Mapping: Spb -> nomorSpb, Sppb -> nomorSppb, BastKeluar -> nomorBast
  let numberField = '';
  if (modelName === 'spb') numberField = 'nomorSpb';
  else if (modelName === 'sppb') numberField = 'nomorSppb';
  else if (modelName === 'bastKeluar') numberField = 'nomorBast';
  else throw new Error(`Number field not defined for model ${modelName}`);

  const lastRecord = await model.findFirst({
    where: {
      [dateField]: {
        gte: startOfYear,
        lt: endOfYear
      }
    },
    orderBy: {
      [dateField]: 'desc'
    }
  });

  let nextSequence = 1;

  if (lastRecord) {
      // Try to parse the sequence from the last record's number field
      if (lastRecord[numberField]) {
          const parts = lastRecord[numberField].split('/');
          if (parts.length > 0) {
              const lastSeq = parseInt(parts[0]);
              if (!isNaN(lastSeq)) {
                  nextSequence = lastSeq + 1;
              }
          }
      }
  }

  // Safety Check: Ensure uniqueness in a loop
  let isUnique = false;
  let candidateNumber = '';

  while (!isUnique) {
      const sequenceStr = String(nextSequence).padStart(3, '0');
      candidateNumber = `${sequenceStr}/${prefix}/${romanMonth}/${year}`;

      const existing = await model.findFirst({
          where: { [numberField]: candidateNumber }
      });

      if (!existing) {
          isUnique = true;
      } else {
          nextSequence++; // Collision found, try next number
      }
  }

  return candidateNumber;
}

function toRoman(num) {
  const map = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let result = '';
  for (const key in map) {
    result += key.repeat(Math.floor(num / map[key]));
    num %= map[key];
  }
  return result;
}
