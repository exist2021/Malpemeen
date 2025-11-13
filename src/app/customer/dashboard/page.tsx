'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

export default function CustomerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/customer/login');
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
        </CardHeader>
        <CardContent>
          <p>This is your customer dashboard. You can view your past orders and manage your account here.</p>
          <Button onClick={handleLogout} className="mt-4">Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
