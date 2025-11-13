
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div key={i} className="flex flex-col space-y-3 rounded-lg border bg-card p-4">
          <Skeleton className="h-[192px] w-full rounded-xl" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {user.displayName || user.email}!</CardTitle>
           <CardDescription>
            This is your customer dashboard. You can view your past orders and manage your account here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} className="mt-4">Logout</Button>
        </CardContent>
      </Card>
      
      <h2 className="mb-8 text-center font-headline text-3xl font-bold tracking-tight">
        Today's Fresh Catch
      </h2>
      <FishListings />
    </div>
    </>
  );
}
