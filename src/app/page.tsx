
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Fish, User, Building } from 'lucide-react';
import { FishLogo } from '@/components/fish-logo';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-primary rounded-full mb-4">
          <FishLogo className="w-16 h-16 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          Welcome to Malpe Meen Pvt Ltd
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Connecting local fisheries with valued customers.
        </p>
         <Button variant="link" className="mt-4 text-accent" onClick={() => router.push('/listings')}>
            Browse Fish Listings
        </Button>
      </div>

      <div className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Choose Your Role</CardTitle>
            <CardDescription>Are you here to buy or sell?</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div
              className="p-8 border rounded-lg text-center hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer flex flex-col items-center"
              onClick={() => router.push('/customer/login')}
            >
              <User className="w-16 h-16 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-2">I'm a Customer</h3>
              <p className="text-muted-foreground mb-6">Browse and purchase the freshest catch from local sellers.</p>
              <Button className="w-full" variant="outline">
                Customer Login
              </Button>
            </div>
            <div
              className="p-8 border rounded-lg text-center hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer flex flex-col items-center"
              onClick={() => router.push('/seller/login')}
            >
              <Building className="w-16 h-16 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-2">I'm a Seller</h3>
              <p className="text-muted-foreground mb-6">List your products, manage sales, and grow your business.</p>
              <Button className="w-full" variant="outline">
                Seller Login
              </Button>
            </div>
          </CardContent>
      </div>
    </div>
  );
}
