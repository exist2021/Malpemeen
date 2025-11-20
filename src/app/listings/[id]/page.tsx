
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getFishListingById, incrementListingCallCount } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Phone, Calendar, User, ArrowLeft, Anchor, Ship, Info, Tag, Copyright, IndianRupee, MapPin, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/firebase';

function ListingDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
       <div className="mb-4">
        <Button variant="outline" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
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

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-base font-semibold">{value}</p>
            </div>
        </div>
    );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
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

  const handleCallClick = () => {
    if (listing) {
        incrementListingCallCount(listing.id, listing.sellerId);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <ListingDetailSkeleton />
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
  
  const hasMedia = listing.mediaUrls && Array.isArray(listing.mediaUrls) && listing.mediaUrls.length > 0;
  const isOwner = user?.uid === listing.sellerId;

  return (
    <>
    <Header />
    <div className="container mx-auto max-w-5xl py-12">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push('/buyer/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </div>
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-6">
               <Carousel className="w-full">
                <CarouselContent>
                  {hasMedia ? (
                    listing.mediaUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square w-full">
                           {url.startsWith('data:video') ? (
                            <video
                                src={url}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                            />
                            ) : (
                            <Image
                                src={url}
                                alt={`Media ${index + 1} of ${listing.productName}`}
                                fill
                                className="object-cover rounded-lg"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="fish"
                            />
                            )}
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="relative aspect-square w-full bg-muted flex items-center justify-center rounded-lg">
                        <span className="text-sm text-muted-foreground">No Media</span>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                {hasMedia && listing.mediaUrls.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </>
                )}
              </Carousel>
            </div>
            
            <div className="md:col-span-3 p-6 flex flex-col">
                <CardHeader className="px-0 pt-0">
                     <CardTitle className="text-3xl font-bold font-headline">{listing.productName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                        <Copyright className="h-4 w-4" />
                        <span>{listing.brandName}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 flex-grow">
                    <p className="text-lg text-muted-foreground">{listing.description}</p>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem icon={IndianRupee} label="Price Per Kg" value={listing.pricePerKg ? `₹${listing.pricePerKg.toLocaleString()}` : 'N/A'} />
                        <DetailItem icon={Scale} label="Total Quantity" value={listing.totalQuantityInTons ? `${listing.totalQuantityInTons} Tons` : 'N/A'} />
                        <DetailItem icon={Calendar} label="Listed Date" value={listing.listedDate ? format(new Date(listing.listedDate), 'MMMM d, yyyy') : 'N/A'} />
                        <DetailItem icon={User} label="Seller" value={listing.sellerName} />
                        <DetailItem icon={Anchor} label="Port Details" value={listing.portDetails} />
                        <DetailItem icon={Ship} label="Boat" value={listing.boatDetails} />
                    </div>
                     {listing.sellerAddress && (
                        <>
                            <Separator className="my-6" />
                            <DetailItem icon={MapPin} label="Seller Address" value={listing.sellerAddress} />
                        </>
                    )}
                </CardContent>
                {!isOwner && (
                    <CardFooter className="px-0 pb-0 mt-6">
                        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg" onClick={handleCallClick}>
                            <a href={`tel:${listing.sellerPhone}`}>
                                <Phone className="mr-2 h-5 w-5" />
                                Call Seller
                            </a>
                        </Button>
                    </CardFooter>
                )}
            </div>

          </div>
      </Card>
    </div>
    </>
  );
}
