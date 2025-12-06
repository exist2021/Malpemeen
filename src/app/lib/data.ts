
'use client';

import type { FishListing, Seller } from '@/app/types';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, where, updateDoc, deleteDoc, DocumentReference, setDoc, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';


export async function getFishListings(): Promise<FishListing[]> {
  const { firestore } = initializeFirebase();
  const listingsCol = collection(firestore, 'fishListings');
  
  // Calculate the timestamp for 12 hours ago
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  // Query for listings created after the calculated timestamp
  const q = query(listingsCol, where('listedDate', '>', twelveHoursAgo), orderBy('listedDate', 'desc'));

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
  
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  // Simplified query: Only fetch by sellerId to avoid composite index issues.
  const q = query(listingsCol, where("sellerId", "==", sellerId));

  try {
    const querySnapshot = await getDocs(q);
    const allListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FishListing));
    
    // Filter by date on the client-side.
    const filteredListings = allListings.filter(listing => new Date(listing.listedDate) > twelveHoursAgo);

    // Sort by date on the client-side to ensure newest are first.
    const sortedListings = filteredListings.sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime());


    return sortedListings;
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
            // Fire-and-forget view count increment directly on the client
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


export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate' | 'sellerName' | 'sellerPhone' | 'sellerAddress' | 'portDetails' | 'brandName'>): Promise<DocumentReference> {
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
   if (!sellerData.portDetails) {
    throw new Error("Seller profile is incomplete. Port and Brand Name are required.");
  }

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data: Omit<FishListing, 'id'> = {
    ...listing,
    sellerName: sellerData.companyName,
    sellerPhone: sellerData.phoneNumber,
    sellerAddress: sellerData.address || '',
    portDetails: sellerData.portDetails,
    brandName: 'Malpe Meen Pvt Ltd',
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
    const { firestore } = initializeFirebase();
    if (!firestore || !listingId || !sellerId) return;
    
    const listingRef = doc(firestore, 'fishListings', listingId);
    const sellerRef = doc(firestore, 'sellers', sellerId);

    const listingUpdateData = { viewCount: increment(1) };
    updateDoc(listingRef, listingUpdateData)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
            path: listingRef.path,
            operation: 'update',
            requestResourceData: listingUpdateData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });

    const sellerUpdateData = { totalViews: increment(1) };
    updateDoc(sellerRef, sellerUpdateData)
      .catch(error => {
          const contextualError = new FirestorePermissionError({
              path: sellerRef.path,
              operation: 'update',
              requestResourceData: sellerUpdateData,
          });
          errorEmitter.emit('permission-error', contextualError);
      });
}

export function incrementListingCallCount(listingId: string, sellerId: string) {
    const { firestore } = initializeFirebase();
    if (!firestore || !listingId || !sellerId) return;

    const listingRef = doc(firestore, 'fishListings', listingId);
    const sellerRef = doc(firestore, 'sellers', sellerId);
    
    const listingUpdateData = { callClickCount: increment(1) };
    updateDoc(listingRef, listingUpdateData)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
            path: listingRef.path,
            operation: 'update',
            requestResourceData: listingUpdateData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });

    const sellerUpdateData = { totalCalls: increment(1) };
    updateDoc(sellerRef, sellerUpdateData)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
            path: sellerRef.path,
            operation: 'update',
            requestResourceData: sellerUpdateData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
}
