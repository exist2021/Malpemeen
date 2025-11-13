
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import type { FishListing } from '@/app/types';
import { getFishListings } from '@/app/lib/data';
import { FishCard } from '@/components/fish-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';


function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  );
}

function FishListings() {
  const [listings, setListings] = useState<FishListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      const listingsData = await getFishListings();
      setListings(listingsData);
      setLoading(false);
    }
    fetchListings();
  }, []);


  if (loading) {
    return <ListingsSkeleton />;
  }

  if (!listings || listings.length === 0) {
    return <p className="mt-8 text-center text-muted-foreground">No fish available right now. Check back later!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <FishCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}


export default function CustomerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/customer/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <>
        <Header />
        <div className="container py-8">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if(auth) {
      auth.signOut();
      router.push('/');
    }
  };


  return (
    <>
    <Header />
    <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight">
                Today's Fresh Catch
            </h2>
        </div>
        <main>
            <FishListings />
        </main>
    </div>
    </>
  );
}

