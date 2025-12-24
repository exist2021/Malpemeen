
'use client';

import { useState } from 'react';
import { SellerForm } from './seller-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FishListing } from '@/app/types';

export default function SellPage() {
    const router = useRouter();
    // State for all form fields, lifted up from SellerForm
    const [productName, setProductName] = useState('');
    const [pricePerKg, setPricePerKg] = useState('');
    const [totalQuantityInTons, setTotalQuantityInTons] = useState('');
    const [boatDetails, setBoatDetails] = useState<FishListing['boatDetails'] | ''>('');
    const [portDetails, setPortDetails] = useState<FishListing['portDetails']>('Malpe Port');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>('');

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-2xl py-6 sm:py-12 px-4">
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push('/seller/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">List Your Fish</CardTitle>
            <CardDescription className="pt-2 text-sm sm:text-base">
              Fill out the form below to list your catch. Your listing will be visible to buyers immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <SellerForm
                formState={{
                    productName,
                    pricePerKg,
                    totalQuantityInTons,
                    boatDetails,
                    portDetails,
                    mediaUrls,
                    videoUrl
                }}
                setFormState={{
                    setProductName,
                    setPricePerKg,
                    setTotalQuantityInTons,
                    setBoatDetails,
                    setPortDetails,
                    setMediaUrls,
                    setVideoUrl
                }}
             />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
