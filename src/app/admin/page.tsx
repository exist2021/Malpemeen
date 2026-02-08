
'use client';

import { useUserRole, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FishLogo } from '@/components/fish-logo';
import { getAllFishListingsForAdmin } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { formatToIST } from '@/lib/utils';
import { Header } from '@/components/layout/header';

export default function AdminDashboard() {
  const { role, isRoleLoading, isAdmin } = useUserRole();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [listings, setListings] = useState<FishListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !isRoleLoading) {
      if (!user) {
        router.push('/');
      } else if (!isAdmin) {
        router.push('/'); // Redirect unauthorized users
      } else {
        // Fetch listings if admin
        setLoadingListings(true);
        getAllFishListingsForAdmin().then(data => {
            setListings(data);
            setLoadingListings(false);
        });
      }
    }
  }, [user, isAdmin, isUserLoading, isRoleLoading, router]);

  if (isUserLoading || isRoleLoading) {
    return (
        <>
            <Header />
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">Loading...</div>
        </>
    );
  }

  if (!isAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
              <FishLogo className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold">Admin Reports</h1>
          </div>
          <div>
              <p className="text-muted-foreground">Internal Use Only</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Total Listings</h3>
              <p className="text-3xl font-bold">{listings.length}</p>
              <p className="text-sm text-muted-foreground">Active & Archived</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">All System Listings</h2>
        {loadingListings ? (
            <p>Loading listings...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map(listing => {
                   const firstMediaUrl = listing.mediaUrls && listing.mediaUrls.length > 0 ? listing.mediaUrls[0] : null;
                   const isExpired = new Date(listing.listedDate).getTime() < (Date.now() - 6 * 60 * 60 * 1000);

                   return (
                      <Card key={listing.id} className={isExpired ? "opacity-75 border-orange-200 bg-orange-50" : ""}>
                          <CardHeader>
                              <CardTitle className="flex justify-between items-start">
                                  <span>{listing.productName}</span>
                                  {isExpired && <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Archived</span>}
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                               <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                  {firstMediaUrl ? (
                                      <Image 
                                          src={firstMediaUrl} 
                                          alt={listing.productName} 
                                          fill 
                                          sizes="(max-width: 640px) 100vw, 300px"
                                          className="object-cover" 
                                      />
                                  ): (
                                      <Camera className="h-8 w-8 text-muted-foreground" />
                                  )}
                              </div>
                              <p className="text-sm">Seller: <span className="font-semibold">{listing.sellerName}</span></p>
                              <p className="text-sm">Listed: {formatToIST(listing.listedDate)}</p>
                              <p className="text-sm">Price: {listing.pricePerKg ? `₹${listing.pricePerKg}` : 'N/A'}</p>
                          </CardContent>
                      </Card>
                   )
              })}
          </div>
        )}
      </div>
    </>
  );
}
