
'use client';

import type { FishListing, Seller } from '@/app/types';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, where, updateDoc, deleteDoc, DocumentReference, setDoc, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';
import { incrementCounts } from '@/ai/flows/increment-counts-flow';


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
            const listingData = { id: docSnap.id, ...docSnap.data() } as FishListing;
            // Fire-and-forget view count increment
            incrementListingViewCount(id, listingData.sellerId);
            return listingData;
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


export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate' | 'sellerName' | 'sellerPhone' | 'sellerAddress'>): Promise<DocumentReference> {
  const { firestore } = initializeFirebase();
  
  const sellerRef = doc(firestore, 'sellers', listing.sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    throw new Error("Seller profile not found! Cannot create listing.");
  }
  
  const sellerData = sellerSnap.data() as Seller;

  if (!sellerData.companyName || !sellerData.phoneNumber) {
      throw new Error("Seller profile is incomplete. Company name and phone number are required.");
  }

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data: Omit<FishListing, 'id'> = {
    ...listing,
    sellerName: sellerData.companyName,
    sellerPhone: sellerData.phoneNumber,
    sellerAddress: sellerData.address || '',
    listedDate: new Date().toISOString(),
    viewCount: 0,
    callClickCount: 0,
  };

  try {
    const docRef = await addDoc(fishListingsRef, data);
    return docRef;
  } catch (error) {
    const contextualError = new FirestorePermissionError({
      path: fishListingsRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
    // Re-throw the original error to be caught by the calling function
    throw error;
  }
}

export async function updateFishListing(id: string, data: Partial<Omit<FishListing, 'id'>>) {
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'fishListings', id);

    try {
        await updateDoc(docRef, data);
    } catch(error) {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', contextualError);
        throw error;
    };
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

export function incrementListingViewCount(listingId: string, sellerId: string) {
    // This is a fire-and-forget operation. We don't await it.
    incrementCounts({ listingId, sellerId, type: 'view' }).catch(error => {
        // Log the error but don't block the UI
        console.warn("Could not increment view count via flow:", error);
    });
}

export function incrementListingCallCount(listingId: string, sellerId: string) {
    // This is a fire-and-forget operation.
    incrementCounts({ listingId, sellerId, type: 'call' }).catch(error => {
        // Log the error but don't block the UI
        console.warn("Could not increment call count via flow:", error);
    });
}
