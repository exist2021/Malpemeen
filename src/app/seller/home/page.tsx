
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function SellerHomeSkeleton() {
    return (
        <main className="container mx-auto max-w-4xl py-12">
            <Skeleton className="h-9 w-1/2 mb-2" />
            <Skeleton className="h-5 w-3/4 mb-12" />
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
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
            <h1 className="text-4xl font-bold tracking-tight font-headline">Welcome, Seller!</h1>
            <p className="mt-2 text-lg text-muted-foreground">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">List a New Product</CardTitle>
                    <CardDescription>Create a new listing for your fresh catch and make it available to customers right away.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                    <Button onClick={() => router.push('/sell')} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">View Dashboard</CardTitle>
                    <CardDescription>See your sales analytics, manage your existing listings, and track your performance.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end justify-center">
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
