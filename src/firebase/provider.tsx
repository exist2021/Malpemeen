
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, DocumentReference } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import type { Buyer, Seller } from '@/app/types';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage?: FirebaseStorage;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  storage: FirebaseStorage | null;
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export type UserRole = 'seller' | 'buyer' | 'admin' | null;

export interface UserRoleHookResult {
    role: UserRole;
    isRoleLoading: boolean;
    isAdmin: boolean; // Added to check if user has admin privileges regardless of their current primary role
}

export interface BuyerProfileResult {
    profile: Buyer | null;
    isLoading: boolean;
}

export interface SellerProfileResult {
    profile: Seller | null;
    isLoading: boolean;
}


// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    // Explicitly set persistence to local (should be default, but ensures it persists across refreshes/tabs)
    setPersistence(auth, browserLocalPersistence)
        .catch(error => {
            console.error("FirebaseProvider: Failed to set auth persistence:", error);
        });

    setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { // Auth state determined
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth]); // Depends on the auth instance

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      storage: storage || null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState, storage]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    storage: context.storage,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export const useStorage = (): FirebaseStorage | null => {
    const { storage } = useFirebase();
    return storage;
}

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};


export const useUserRole = (): UserRoleHookResult => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [role, setRole] = useState<UserRole>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRoleLoading, setIsRoleLoading] = useState(true);

    useEffect(() => {
        if (isUserLoading) {
            setIsRoleLoading(true);
            return;
        }
        if (!user) {
            setRole(null);
            setIsAdmin(false);
            setIsRoleLoading(false);
            return;
        }

        const checkRoles = async () => {
            setIsRoleLoading(true);

            // Set isAdmin based on phone number
            const userIsAdmin = user.phoneNumber === '+919892334681';
            setIsAdmin(userIsAdmin);

            const sellerRef = doc(firestore, 'sellers', user.uid);
            const sellerSnap = await getDoc(sellerRef);
            if (sellerSnap.exists()) {
                setRole('seller');
                setIsRoleLoading(false);
                return;
            }

            const buyerRef = doc(firestore, 'buyers', user.uid);
            const buyerSnap = await getDoc(buyerRef);
            if (buyerSnap.exists()) {
                setRole('buyer');
                setIsRoleLoading(false);
                return;
            }

            if (userIsAdmin) {
                setRole('admin');
                setIsRoleLoading(false);
                return;
            }

            setRole(null);
            setIsRoleLoading(false);
        };

        checkRoles();
    }, [user, isUserLoading, firestore]);

    return { role, isRoleLoading, isAdmin };
};

export const useBuyerProfile = (): BuyerProfileResult => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [profile, setProfile] = useState<Buyer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (user && firestore) {
            const docRef = doc(firestore, 'buyers', user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as Buyer);
                }
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, firestore, isUserLoading]);

    return { profile, isLoading: isUserLoading || isLoading };
};

export const useSellerProfile = (): SellerProfileResult => {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [profile, setProfile] = useState<Seller | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const docRef = doc(firestore, 'sellers', user.uid);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as Seller);
                }
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, firestore, isUserLoading]);


    return { profile, isLoading: isUserLoading || isLoading };
};
