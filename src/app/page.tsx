
'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <>
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <div className="mx-auto h-24 w-24">
                <FishLogo className="text-primary"/>
            </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Welcome to Malpe Meen Pvt Ltd</h1>
          <p className="mt-2 text-lg text-muted-foreground">Connecting local sellers with fresh seafood lovers.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>Are you here to buy or sell?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 text-lg"
              onClick={() => router.push('/customer/login')}
            >
              <span>I'm a</span>
              <span className="font-bold">Customer</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 text-lg"
              onClick={() => router.push('/seller/login')}
            >
              <span>I'm a</span>
              <span className="font-bold">Seller</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
