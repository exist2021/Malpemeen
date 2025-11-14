
'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSellerFishListings } from '@/app/lib/data';
import type { FishListing } from '@/app/types';
import Image from 'next/image';
import { Pencil, LogOut, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';

function SellerListings() {
    const { user } = useUser();
    const [listings, setListings] = useState<FishListing[]>([]);
    const [loading, setLoading] = useState(true);

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
        return <p className="text-center text-muted-foreground">You haven't listed any fish yet.</p>
    }

    return (
        <div className="space-y-4">
            {listings.map(listing => {
                const firstMediaUrl = listing.mediaUrls && listing.mediaUrls.length > 0 ? listing.mediaUrls[0] : null;
                const isVideo = firstMediaUrl && firstMediaUrl.startsWith('data:video');

                return (
                    <Card key={listing.id} className="flex items-center p-4 gap-4">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex items-center justify-center">
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
                        <div className="flex-grow">
                            <p className="font-semibold truncate">{listing.productName}</p>
                            <p className="text-sm text-muted-foreground">Listed on {new Date(listing.listedDate).toLocaleDateString()}</p>
                        </div>
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/sell/${listing.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Listing</span>
                            </Link>
                        </Button>
                    </Card>
                );
            })}
        </div>
    )

}

export default function SellerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <>
        <Header />
        <div className="container py-8">
          <p>Loading...</p>
        </div>
      </>
    );
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
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.displayName || user.email}!</CardTitle>
            <CardDescription>This is your seller dashboard. You can manage your listings here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button asChild>
              <Link href="/sell">Create a new listing</Link>
            </Button>
            <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>View and manage your current fish listings.</CardDescription>
            </CardHeader>
            <CardContent>
                <SellerListings />
            </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
