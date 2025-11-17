
'use client';

import type { FishListing, Seller } from '@/app/types';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, where, updateDoc, deleteDoc, DocumentReference, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';

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


export async function addFishListing(listing: Omit<FishListing, 'id' | 'listedDate' | 'sellerName' | 'sellerPhone'>): Promise<DocumentReference> {
  const { firestore } = initializeFirebase();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not authenticated.");
  }
  
  const sellerRef = doc(firestore, 'sellers', listing.sellerId);
  let sellerSnap = await getDoc(sellerRef);

  // If seller profile doesn't exist, create it.
  if (!sellerSnap.exists()) {
    console.log(`Seller profile for ${listing.sellerId} not found. Creating one.`);
    const newSellerData: Seller = {
      id: currentUser.uid,
      name: currentUser.displayName || "New Seller",
      email: currentUser.email || "No Email",
      phoneNumber: currentUser.phoneNumber || "No Phone",
    };
    try {
      await setDoc(sellerRef, newSellerData);
      sellerSnap = await getDoc(sellerRef); // Re-fetch the snapshot
      if (!sellerSnap.exists()) {
          // This would be a more serious issue, like a permissions problem on creation
          throw new Error("Failed to create and retrieve seller profile.");
      }
    } catch (creationError: any) {
      console.error("Error creating seller profile:", creationError);
      const contextualError = new FirestorePermissionError({
        path: sellerRef.path,
        operation: 'create',
        requestResourceData: newSellerData,
      });
      errorEmitter.emit('permission-error', contextualError);
      // Re-throw the error to be caught by the calling form
      throw new Error(`Failed to create seller profile. ${creationError.message}`);
    }
  }
  
  const sellerData = sellerSnap.data() as Seller;

  if (!sellerData.name || !sellerData.phoneNumber) {
      throw new Error("Seller profile is incomplete. Name and phone number are required.");
  }

  const fishListingsRef = collection(firestore, `fishListings`);
  
  const data: Omit<FishListing, 'id'> = {
    ...listing,
    sellerName: sellerData.name,
    sellerPhone: sellerData.phoneNumber,
    listedDate: new Date().toISOString(),
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
