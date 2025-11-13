'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getFishListingById } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Phone, Calendar, User, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { format } from 'date-fns';

function ListingDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
       <div className="mb-4">
        <Skeleton className="h-10 w-24" />
      </div>
      <Card>
        <CardContent className="grid md:grid-cols-2 gap-8 p-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
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
        .catch(() => setError("Failed to fetch listing details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <ListingDetailSkeleton />
      </>
    );
  }

  if (error) {
    return <div className="container text-center py-12">{error}</div>;
  }
  
  if (!listing) {
    return <div className="container text-center py-12">Listing not found.</div>;
  }
  
  const hasPhotos = listing.photoUrls && Array.isArray(listing.photoUrls) && listing.photoUrls.length > 0;

  return (
    <>
    <Header />
    <div className="container mx-auto max-w-4xl py-12">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            <div className="p-4 md:p-6">
               <Carousel className="w-full">
                <CarouselContent>
                  {hasPhotos ? (
                    listing.photoUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square w-full">
                          <Image
                            src={url}
                            alt={`Photo ${index + 1} of ${listing.description}`}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            data-ai-hint="fish"
                          />
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="relative aspect-square w-full bg-muted flex items-center justify-center rounded-lg">
                        <span className="text-sm text-muted-foreground">No Photo</span>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                {hasPhotos && listing.photoUrls.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </>
                )}
              </Carousel>
            </div>
            
            <div className="p-6 flex flex-col justify-between">
                <div>
                    <CardHeader className="px-0 pt-0">
                        <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{listing.sellerName || 'A Seller'}</span>
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold font-headline">{listing.description}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Listed on {format(new Date(listing.listedDate), 'MMMM d, yyyy')}</span>
                        </div>
                    </CardContent>
                </div>
                <CardFooter className="px-0 pb-0">
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg">
                        <a href={`tel:${listing.sellerPhone}`}>
                            <Phone className="mr-2 h-5 w-5" />
                            Call Seller
                        </a>
                    </Button>
                </CardFooter>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
