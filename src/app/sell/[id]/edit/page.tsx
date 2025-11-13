
'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SellerForm } from '@/app/sell/seller-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getFishListingById } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';

export default function EditSellPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [listing, setListing] = useState<FishListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getFishListingById(id)
        .then(data => {
          if (data) {
            setListing(data);
          } else {
            setError("Listing not found.");
          }
        })
        .catch(() => setError("Failed to fetch listing."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || isUserLoading) {
    return (
      <>
      <Header />
        <div className="container mx-auto max-w-2xl py-12">
             <div className="mb-4">
                <Button variant="outline" onClick={() => router.back()} disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto pt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
        <>
            <Header />
            <div className="container text-center py-12">{error}</div>
        </>
    );
  }
  
  if (!listing) {
    return (
        <>
            <Header />
            <div className="container text-center py-12">Listing not found.</div>
        </>
    );
  }
  
  if(listing.sellerId !== user?.uid){
    return (
        <>
            <Header />
            <div className="container text-center py-12">You are not authorized to edit this listing.</div>
        </>
    );
  }


  return (
    <>
    <Header />
    <div className="container mx-auto max-w-2xl py-12">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight font-headline">Edit Your Listing</CardTitle>
          <CardDescription className="pt-2">
            Update the details for your fish listing below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SellerForm listing={listing} />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
