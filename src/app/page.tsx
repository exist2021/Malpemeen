
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const screenshots = [
    {
        title: 'Welcome Page',
        description: 'The initial landing page where users choose their role as a buyer or a seller.',
        imageUrl: 'https://images.unsplash.com/photo-1559106037-5435fac0c497?q=80&w=2070&auto=format&fit=crop',
        imageHint: 'two cards buyer seller'
    },
    {
        title: 'Login Page',
        description: 'The authentication screen for both buyers and sellers, featuring email and phone login options.',
        imageUrl: 'https://images.unsplash.com/photo-1574636904128-97036a439a9c?q=80&w=1974&auto=format&fit=crop',
        imageHint: 'login form'
    },
    {
        title: 'Buyer Dashboard',
        description: 'Buyers can browse, search, and filter through all available fish listings from various sellers.',
        imageUrl: 'https://images.unsplash.com/photo-1599056024921-b3d551c89b88?q=80&w=1974&auto=format&fit=crop',
        imageHint: 'product grid'
    },
    {
        title: 'Seller Dashboard',
        description: 'Sellers can view their sales statistics, manage their listings, and see performance metrics.',
        imageUrl: 'https://images.unsplash.com/photo-1579558366039-4d61c6b65a4e?q=80&w=2070&auto=format&fit=crop',
        imageHint: 'dashboard statistics'
    },
    {
        title: 'Listing Details Page',
        description: 'A detailed view of a single fish listing, with a photo carousel, description, price, and seller information.',
        imageUrl: 'https://images.unsplash.com/photo-1611865882658-e50a23c537c9?q=80&w=1974&auto=format&fit=crop',
        imageHint: 'product details page'
    },
    {
        title: 'Create/Edit Listing Form',
        description: 'A form for sellers to create or update their listings, including media uploads and a voice-to-text feature.',
        imageUrl: 'https://images.unsplash.com/photo-1577960255302-538686104949?q=80&w=2070&auto=format&fit=crop',
        imageHint: 'web form'
    },
];

export default function ScreenshotGalleryPage() {

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <div className="absolute top-4 left-4 z-20">
        <FishLogo className="h-28 w-28 text-primary" />
      </div>

      <div className="relative z-10 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mt-6 font-headline">Application Screenshots</h1>
        <p className="mt-2 text-lg text-muted-foreground">Here is a visual overview of the key screens in your application.</p>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {screenshots.map((screen) => (
                <Card key={screen.title} className="flex flex-col text-center hover:shadow-lg transition-shadow bg-card overflow-hidden">
                    <CardContent className="p-0">
                       <div className="relative aspect-video w-full">
                         <Image
                            src={screen.imageUrl}
                            alt={screen.title}
                            fill
                            className="object-cover"
                            data-ai-hint={screen.imageHint}
                         />
                       </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">{screen.title}</CardTitle>
                        <CardDescription>{screen.description}</CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
      </div>
       <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>This is a temporary view. When you're ready, I can restore the original welcome page.</p>
      </div>
    </div>
  );
}
