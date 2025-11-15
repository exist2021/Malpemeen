
'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSellerFishListings, deleteFishListing } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import Image from 'next/image';
import { Pencil, LogOut, Video, Trash2, Loader2, PlusCircle } from 'lucide-react';
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

function SellerListings() {
    const { user } = useUser();
    const { toast } = useToast();
    const [listings, setListings] = useState<FishListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startDeleteTransition] = useTransition();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<FishListing | null>(null);

    useEffect(() => {
        if (user) {
            getSellerFishListings(user.uid).then(data => {
                // Sort by date on the client side to avoid complex index
                const sortedData = data.sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime());
                setListings(sortedData);
                setLoading(false);
            });
        }
    }, [user]);

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

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (listings.length === 0) {
        return (
             <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <h3 className="mt-2 text-sm font-semibold text-foreground">No listings yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new listing.</p>
                <div className="mt-6">
                    <Button asChild>
                      <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4" /> Create Listing</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {listings.map(listing => {
                    const firstMediaUrl = listing.mediaUrls && listing.mediaUrls.length > 0 ? listing.mediaUrls[0] : null;
                    const isVideo = firstMediaUrl && firstMediaUrl.startsWith('data:video');

                    return (
                        <Card key={listing.id} className="flex items-center p-4 gap-4">
                            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                {firstMediaUrl ? (
                                    isVideo ? (
                                        <Video className="h-8 w-8 text-muted-foreground" />
                                    ) : (
                                        <Image src={firstMediaUrl} alt={listing.productName} layout="fill" className="object-cover" />
                                    )
                                ): (
                                    <div className="text-xs text-muted-foreground">No Media</div>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold truncate">{listing.productName}</p>
                                <p className="text-sm text-muted-foreground">Listed on {new Date(listing.listedDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
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

export default function SellerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <>
        <Header />
         <div className="container mx-auto p-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
              </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Listings</h1>
           <Button asChild>
              <Link href="/sell">Create a new listing</Link>
           </Button>
        </div>

         <Card>
              <CardContent className="p-6">
                  <SellerListings />
              </CardContent>
          </Card>
      </main>
    </>
  );
}
