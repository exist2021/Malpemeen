
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import type { Seller } from '@/app/types';

function SellerHomeSkeleton() {
    return (
        <main className="container mx-auto max-w-4xl py-12">
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}


export default function SellerHomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && firestore) {
        setLoading(true);
        const fetchSellerData = async () => {
            const sellerRef = doc(firestore, 'sellers', user.uid);
            const sellerSnap = await getDoc(sellerRef);
            if(sellerSnap.exists()){
                setSeller(sellerSnap.data() as Seller);
            }
            setLoading(false);
        }
        fetchSellerData();
    } else if (!isUserLoading) {
        setLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  if (isUserLoading || loading) {
      return (
        <>
            <Header />
            <SellerHomeSkeleton />
        </>
      )
  }


  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Welcome, {seller?.contactName || 'Seller'}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Great to see you again! Your dashboard is updated and ready for new orders. Let’s make today productive.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow bg-card p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl font-bold">List a New Product</CardTitle>
                    <CardDescription className="mt-2">Create a new listing for your fresh catch and make it available to customers right away.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center p-0">
                    <Button onClick={() => router.push('/sell')} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow bg-card p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl font-bold">View Dashboard</CardTitle>
                    <CardDescription className="mt-2">See your sales analytics, manage your existing listings, and track your performance.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end justify-center p-0">
                     <Button onClick={() => router.push('/seller/dashboard')} className="w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
