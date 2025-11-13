'use client';

import type { FishListing } from '@/app/types';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Seller } from '@/app/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export async function getFishListings(): Promise<FishListing[]> {
  const { firestore } = initializeFirebase();
  const listings: FishListing[] = [];
  
  try {
    // We need to get all sellers, then all their listings.
    const sellersSnapshot = await getDocs(collection(firestore, 'sellers'));
    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id;
      const fishListingsRef = collection(firestore, `sellers/${sellerId}/fishListings`);
      const fishListingsSnapshot = await getDocs(fishListingsRef);
      
      const sellerData = sellerDoc.data() as Seller;

      fishListingsSnapshot.forEach((doc) => {
        const listingData = doc.data();
        listings.push({
          id: doc.id,
          description: listingData.description,
          photoUrl: listingData.photoUrl,
          sellerId: listingData.sellerId,
          listedDate: listingData.listedDate,
          sellerName: sellerData.name, 
          sellerPhone: sellerData.phoneNumber,
        });
      });
    }
  } catch (e) {
    console.error("Error fetching fish listings: ", e);
    // In a real app, handle this error more gracefully
  }

  return listings;
}

export function addFishListing(listing: Omit<FishListing, 'id' | 'sellerName' | 'sellerPhone' | 'listedDate'> & { sellerId: string; photoUrl: string }) {
  const { firestore } = initializeFirebase();
  const fishListingsRef = collection(firestore, `sellers/${listing.sellerId}/fishListings`);
  
  const data = {
    ...listing,
    listedDate: new Date().toISOString(),
  };

  addDoc(fishListingsRef, data).catch(error => {
    const contextualError = new FirestorePermissionError({
      path: fishListingsRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}
