
'use client';

import { useUser, useSellerProfile } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSellerFishListings, deleteFishListing } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import Image from 'next/image';
import { Pencil, Trash2, Loader2, PlusCircle, List, IndianRupee, Package, Camera } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns';

function SellerListings({ listings, setListings }: { listings: FishListing[], setListings: React.Dispatch<React.SetStateAction<FishListing[]>> }) {
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = useTransition();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<FishListing | null>(null);

    const openDeleteDialog = (listing: FishListing) => {
        setListingToDelete(listing);
        setDialogOpen(true);
    }
    
    const handleDelete = () => {
        if (!listingToDelete) return;
        
        startDeleteTransition(async () => {
            try {
                await deleteFishListing(listingToDelete.id);
                setListings(prev => prev.filter(l => l.id !== listingToDelete.id));
                toast({
                    title: 'Listing Deleted',
                    description: `"${listingToDelete.productName}" has been removed.`,
                });
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Deletion Failed',
                    description: 'Could not delete the listing. Please try again.',
                });
            } finally {
                setDialogOpen(false);
                setListingToDelete(null);
            }
        });
    }
    
    if (listings.length === 0) {
        return (
             <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No listings yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first listing.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {listings.map(listing => {
                    const firstMediaUrl = listing.mediaUrls && listing.mediaUrls.length > 0 ? listing.mediaUrls[0] : null;

                    return (
                        <Card key={listing.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:shadow-md transition-shadow">
                            <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                {firstMediaUrl ? (
                                    <Image 
                                        src={firstMediaUrl} 
                                        alt={listing.productName} 
                                        fill 
                                        sizes="(max-width: 640px) 100px, 150px"
                                        className="object-cover" 
                                    />
                                ): (
                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-grow min-w-0 text-center sm:text-left">
                                <Link href={`/listings/${listing.id}`} className="font-semibold truncate hover:underline">{listing.productName}</Link>
                                <p className="text-sm text-muted-foreground">
                                    {listing.pricePerKg ? `₹${listing.pricePerKg.toLocaleString()} / Kg` : 'Price not set'}
                                </p>
                                <p className="text-sm text-muted-foreground">Listed on {format(new Date(listing.listedDate), 'MMM d, yyyy')}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 mt-4 sm:mt-0">
                                <Button asChild variant="outline" size="icon">
                                    <Link href={`/sell/${listing.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit Listing</span>
                                    </Link>
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(listing)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Listing</span>
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        listing for "{listingToDelete?.productName}".
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, delete it
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

}

function DashboardSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
             <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
             <Card>
                <CardHeader>
                     <Skeleton className="h-8 w-48" />
                     <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </CardContent>
             </Card>
      </div>
    );
}


export default function SellerDashboard() {
  const { user, isUserLoading } = useUser();
  const { profile: seller, isLoading: isSellerLoading } = useSellerProfile();
  const router = useRouter();
  const [listings, setListings] = useState<FishListing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user) {
        setIsListingsLoading(true);
        const fetchListings = async () => {
            const data = await getSellerFishListings(user.uid);
            setListings(data);
            setIsListingsLoading(false);
        }
        fetchListings();
    }
  }, [user]);

  if (isUserLoading || isSellerLoading || isListingsLoading) {
    return (
      <>
        <Header />
        <DashboardSkeleton />
      </>
    );
  }

  const totalValue = listings.reduce((acc, listing) => acc + ((listing.pricePerKg || 0) * (listing.totalQuantityInTons || 0) * 1000), 0);


  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{seller?.companyName || 'Seller Dashboard'}</h1>
           <Button asChild>
              <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4" /> Create New</Link>
            </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{listings.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Your currently active listings
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                     <p className="text-xs text-muted-foreground">
                        Estimated value of all listings
                    </p>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>Manage your existing product listings below.</CardDescription>
            </CardHeader>
            <CardContent>
                <SellerListings listings={listings} setListings={setListings} />
            </CardContent>
        </Card>
      </main>
    </>
  );
}
