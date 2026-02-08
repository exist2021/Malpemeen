
'use client';

import { useUser, useSellerProfile, useUserRole } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSellerFishListings, deleteFishListing } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import Image from 'next/image';
import { Pencil, Trash2, Loader2, PlusCircle, List, IndianRupee, Package, Camera, Video } from 'lucide-react';
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
import { formatToIST } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

function SellerListings({ listings, setListings }: { listings: FishListing[], setListings: React.Dispatch<React.SetStateAction<FishListing[]>> }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, startDeleteTransition] = useTransition();
    const { t } = useI18n();

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
                <h3 className="mt-4 text-lg font-semibold text-foreground">{t('seller.dashboard.no_listings')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('seller.dashboard.no_listings_desc')}</p>
                <div className="mt-6">
                    <Button asChild>
                        <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4" /> {t('seller.dashboard.create_listing')}</Link>
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
                    const hasVideo = !!listing.videoUrl;

                    return (
                        <Card 
                            key={listing.id} 
                            className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/listings/${listing.id}`)}
                        >
                            <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                {firstMediaUrl ? (
                                    <Image 
                                        src={firstMediaUrl} 
                                        alt={listing.productName} 
                                        fill 
                                        sizes="(max-width: 640px) 100px, 150px"
                                        className="object-cover" 
                                    />
                                ) : hasVideo ? (
                                     <Video className="h-8 w-8 text-muted-foreground" />
                                ) : (
                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-grow min-w-0 text-center sm:text-left">
                                <span className="font-semibold truncate hover:underline">{listing.productName}</span>
                                <p className="text-sm text-muted-foreground">
                                    {listing.pricePerKg ? `₹${listing.pricePerKg.toLocaleString()} / Kg` : t('seller.dashboard.price_not_set')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('seller.dashboard.listed_on').replace('{date}', formatToIST(listing.listedDate))}
                                </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                                <Button asChild variant="outline" size="icon">
                                    <Link href={`/sell/${listing.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">{t('common.edit')}</span>
                                    </Link>
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(listing)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{t('common.delete')}</span>
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('common.delete_warning').replace('{name}', listingToDelete?.productName || '')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.yes_delete')}
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
  const { role, isRoleLoading } = useUserRole();
  const { profile: seller, isLoading: isSellerLoading } = useSellerProfile();
  const router = useRouter();
  const [listings, setListings] = useState<FishListing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const { t } = useI18n();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    } else if (!isUserLoading && user && !isRoleLoading && role !== 'seller') {
        // If logged in but not a seller, redirect to appropriate page
        if (role === 'buyer') {
            router.push('/buyer/dashboard');
        } else if (role === 'admin') {
            router.push('/admin');
        } else {
            // User has no role yet, maybe they should be a seller? 
            // Or redirect to home/login
            router.push('/seller/login');
        }
    }
  }, [user, isUserLoading, role, isRoleLoading, router]);

  useEffect(() => {
    if (user && role === 'seller') {
        setIsListingsLoading(true);
        const fetchListings = async () => {
            const data = await getSellerFishListings(user.uid);
            setListings(data);
            setIsListingsLoading(false);
        }
        fetchListings();
    }
  }, [user, role]);

  if (isUserLoading || isRoleLoading || isSellerLoading || isListingsLoading) {
    return (
      <>
        <Header />
        <DashboardSkeleton />
      </>
    );
  }

  // Double check role after loading
  if (role !== 'seller') {
      return null;
  }

  const totalValue = listings.reduce((acc, listing) => acc + ((listing.pricePerKg || 0) * (listing.totalQuantityInTons || 0) * 1000), 0);


  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{seller?.companyName || t('seller.dashboard.title')}</h1>
           <Button asChild>
              <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4" /> {t('seller.dashboard.create_listing')}</Link>
            </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('seller.dashboard.active_listings')}</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{listings.length}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('seller.dashboard.active_listings_desc')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('seller.dashboard.total_value')}</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                     <p className="text-xs text-muted-foreground">
                        {t('seller.dashboard.total_value_desc')}
                    </p>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('seller.dashboard.your_listings')}</CardTitle>
                    <CardDescription>{t('seller.dashboard.manage_listings')}</CardDescription>
                </div>
                 <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                    <Link href="/sell"><PlusCircle className="mr-2 h-4 w-4" /> {t('seller.dashboard.add_new')}</Link>
                 </Button>
            </CardHeader>
            <CardContent>
                <SellerListings listings={listings} setListings={setListings} />
            </CardContent>
        </Card>
      </main>
    </>
  );
}
