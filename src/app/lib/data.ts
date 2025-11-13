'use client';

import type { FishListing } from '@/app/types';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function getFishListings(): Promise<FishListing[]> {
  const { firestore } = initializeFirebase();
  const listingsCol = collection(firestore, 'fishListings');
  const q = query(listingsCol, orderBy('listedDate', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FishListing));
    return listings;
  } catch (e: any) {
     if (e.code === 'permission-denied') {
        const contextualError = new FirestorePermissionError({
            path: 'fishListings',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    } else {
        console.error("Error fetching fish listings: ", e);
    }
    return [];
  }
}

export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate'>) {
  const { firestore } = initializeFirebase();
  
  // Get seller info to denormalize
  const sellerRef = doc(firestore, 'sellers', listing.sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    throw new Error("Seller profile not found!");
  }
  const sellerData = sellerSnap.data();

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data = {
    ...listing,
    sellerName: sellerData.name,
    sellerPhone: sellerData.phoneNumber,
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
