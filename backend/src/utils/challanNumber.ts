import { Prisma } from '@prisma/client';

function pad(n: number) {
  return String(n).padStart(4, '0');
}

export async function nextChallanNumber(tx: Prisma.TransactionClient) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;
  const key = `CHALLAN-${datePart}`;

  const seq = await tx.documentSequence.upsert({
    where: { key },
    create: { key, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  return `CH-${datePart}-${pad(seq.lastValue)}`;
}
