
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FishListing } from '@/app/types';
import { getFishListings } from '@/app/lib/data';
import { FishCard } from '@/components/fish-card';
import { Skeleton } from '@/components/ui/skeleton';


function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
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
  
  // No strict redirect, page is public now
  // useEffect(() => {
  //   if (!isUserLoading && !user) {
  //     router.push('/customer/login');
  //   }
  // }, [user, isUserLoading, router]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="font-bold text-2xl tracking-tight uppercase">
                Dashboard
            </h1>
        </div>
        <main>
            <FishListings />
        </main>
    </div>
  );
}
