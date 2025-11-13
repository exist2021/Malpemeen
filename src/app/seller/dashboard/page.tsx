'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import Link from 'next/link';

export default function SellerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if(auth) {
      auth.signOut();
      router.push('/');
    }
  };


  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.displayName || user.email}!</CardTitle>
          <CardDescription>This is your seller dashboard. You can manage your listings here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/sell">Create a new listing</Link>
          </Button>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
