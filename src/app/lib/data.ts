
'use client';

import type { FishListing } from '@/app/types';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, where, updateDoc, deleteDoc } from 'firebase/firestore';
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

export async function getSellerFishListings(sellerId: string): Promise<FishListing[]> {
  const { firestore } = initializeFirebase();
  const listingsCol = collection(firestore, 'fishListings');
  // Removed orderBy to avoid needing a composite index. Sorting is now done on the client.
  const q = query(listingsCol, where("sellerId", "==", sellerId));

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FishListing));
  } catch (e: any) {
    if (e.code === 'permission-denied') {
      const contextualError = new FirestorePermissionError({
        path: `fishListings`,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', contextualError);
    } else {
      console.error("Error fetching seller fish listings: ", e);
    }
    return [];
  }
}


export async function getFishListingById(id: string): Promise<FishListing | null> {
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'fishListings', id);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as FishListing;
        } else {
            return null;
        }
    } catch (e: any) {
        if (e.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', contextualError);
        } else {
            console.error("Error fetching fish listing by id: ", e);
        }
        return null;
    }
}


export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate' | 'sellerName' | 'sellerPhone'>) {
  const { firestore } = initializeFirebase();
  
  // Get seller info to denormalize
  const sellerRef = doc(firestore, 'sellers', listing.sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    throw new Error("Seller profile not found!");
  }
  const sellerData = sellerSnap.data();

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data: Omit<FishListing, 'id'> = {
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

export async function updateFishListing(id: string, data: Partial<Omit<FishListing, 'id'>>) {
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'fishListings', id);

    updateDoc(docRef, data).catch(error => {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
}

export async function deleteFishListing(id: string) {
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'fishListings', id);

    deleteDoc(docRef).catch(error => {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
    });
}
