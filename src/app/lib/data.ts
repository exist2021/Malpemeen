
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
  
  // Calculate the timestamp for 6 hours ago
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  // Query for listings created after the calculated timestamp
  const q = query(listingsCol, where('listedDate', '>', sixHoursAgo), orderBy('listedDate', 'desc'));

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
  
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // Simplified query: Only fetch by sellerId to avoid composite index issues.
  const q = query(listingsCol, where("sellerId", "==", sellerId));

  try {
    const querySnapshot = await getDocs(q);
    const allListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FishListing));
    
    // Filter by date on the client-side.
    const filteredListings = allListings.filter(listing => new Date(listing.listedDate) > sixHoursAgo);

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

export async function getAllFishListingsForAdmin(): Promise<FishListing[]> {
  const { firestore } = initializeFirebase();
  const listingsCol = collection(firestore, 'fishListings');
  // Admin sees all listings, sorted by date (newest first)
  const q = query(listingsCol, orderBy('listedDate', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FishListing));
  } catch (e: any) {
     if (e.code === 'permission-denied') {
        const contextualError = new FirestorePermissionError({
            path: 'fishListings',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    } else {
        console.error("Error fetching admin fish listings: ", e);
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


export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate' | 'sellerName' | 'sellerPhone' | 'sellerAddress' | 'brandName'>): Promise<DocumentReference> {
  console.log("addFishListing started for sellerId:", listing.sellerId);
  const { firestore } = initializeFirebase();
  
  console.log("Fetching seller profile...");
  const sellerRef = doc(firestore, 'sellers', listing.sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    console.error("Seller profile not found for ID:", listing.sellerId);
    throw new Error("Seller profile not found! Cannot create listing.");
  }
  
  const sellerData = sellerSnap.data() as Seller;
  console.log("Seller data retrieved:", sellerData.companyName);

  if (!sellerData.companyName || !sellerData.phoneNumber) {
      throw new Error("Seller profile is incomplete. Company name and phone number are required.");
  }
  
  // Port is now provided in listing, or falls back to profile
  if (!listing.portDetails && !sellerData.portDetails) {
    throw new Error("Port details are required.");
  }

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data: Omit<FishListing, 'id'> = {
    ...listing,
    sellerName: sellerData.companyName,
    sellerPhone: sellerData.phoneNumber,
    sellerAddress: sellerData.address || '',
    portDetails: listing.portDetails || sellerData.portDetails,
    brandName: 'Malpe Meen Pvt Ltd',
    listedDate: new Date().toISOString(),
    viewCount: 0,
    callClickCount: 0,
  };

  try {
    console.log("Attempting to addDoc to fishListings...");
    const docRef = await addDoc(fishListingsRef, data);
    console.log("Successfully added document with ID:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("Error in addFishListing (Firestore write):", error);
    const contextualError = new FirestorePermissionError({
      path: fishListingsRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
    throw error;
  }
}

export async function updateFishListing(id: string, data: Partial<Omit<FishListing, 'id'>>) {
    console.log("updateFishListing started for ID:", id);
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'fishListings', id);

    try {
        await updateDoc(docRef, data);
        console.log("Successfully updated document:", id);
    } catch(error: any) {
        console.error("Error in updateFishListing:", error);
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

    try {
        await deleteDoc(docRef);
    } catch(error: any) {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
        throw error;
    }
}

export function incrementListingViewCount(listingId: string, sellerId: string) {
    const { firestore } = initializeFirebase();
    if (!firestore || !listingId || !sellerId) return;
    
    const listingRef = doc(firestore, 'fishListings', listingId);
    const sellerRef = doc(firestore, 'sellers', sellerId);

    const listingUpdateData = { viewCount: increment(1) };
    updateDoc(listingRef, listingUpdateData)
      .catch(error => {
        // Silently fail view increments to not interrupt user flow
      });

    const sellerUpdateData = { totalViews: increment(1) };
    updateDoc(sellerRef, sellerUpdateData)
      .catch(error => {
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
      });

    const sellerUpdateData = { totalCalls: increment(1) };
    updateDoc(sellerRef, sellerUpdateData)
      .catch(error => {
      });
}
