
'use server';
/**
 * @fileOverview A secure flow to increment view and call counts.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
try {
  if (!getApps().length) {
    initializeApp();
  }
} catch (e) {
  // Ignore re-initialization error in dev mode
  if (process.env.NODE_ENV !== 'development' || !getApps().length) {
    console.error('Firebase Admin initialization error:', e);
  }
}

const db = getFirestore();

const IncrementCountsInputSchema = z.object({
  listingId: z.string().describe("The ID of the fish listing."),
  sellerId: z.string().describe("The ID of the seller."),
  type: z.enum(['view', 'call']).describe("The type of count to increment."),
});

export type IncrementCountsInput = z.infer<typeof IncrementCountsInputSchema>;

export async function incrementCounts(input: IncrementCountsInput): Promise<void> {
  await incrementCountsFlow(input);
}

const incrementCountsFlow = ai.defineFlow(
  {
    name: 'incrementCountsFlow',
    inputSchema: IncrementCountsInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { listingId, sellerId, type } = input;
    const listingRef = db.collection('fishListings').doc(listingId);
    const sellerRef = db.collection('sellers').doc(sellerId);

    const batch = db.batch();

    if (type === 'view') {
      batch.update(listingRef, { viewCount: FieldValue.increment(1) });
      batch.update(sellerRef, { totalViews: FieldValue.increment(1) });
    } else if (type === 'call') {
      batch.update(listingRef, { callClickCount: FieldValue.increment(1) });
      batch.update(sellerRef, { totalCalls: FieldValue.increment(1) });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error(`Error incrementing ${type} count:`, error);
        // We don't throw here as this is a non-critical background task
    }
  }
);
