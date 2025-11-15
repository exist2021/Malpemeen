'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight, User, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-12">
        <FishLogo className="h-24 w-24 text-primary mx-auto"/>
        <h1 className="text-4xl font-bold tracking-tight mt-6 font-headline">Welcome to Malpe Meen</h1>
        <p className="mt-2 text-lg text-muted-foreground">Connecting sellers with customers, seamlessly.</p>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                    <User className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">I'm a Customer</CardTitle>
                    <CardDescription>Browse and buy the freshest catch directly from the source.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                    <Button onClick={() => router.push('/customer/login')} className="w-full">
                        Browse Listings <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex flex-col text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                    <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">I'm a Seller</CardTitle>
                    <CardDescription>List your products and reach a wider market of customers.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end justify-center">
                     <Button onClick={() => router.push('/seller/login')} className="w-full">
                        Start Selling <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
