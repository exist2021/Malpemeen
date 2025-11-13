
'use client';

import { SellerForm } from './seller-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';

export default function SellPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight font-headline">List Your Fish</CardTitle>
            <CardDescription className="pt-2">
              Fill out the form below to list your catch. Your listing will be visible to customers immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
