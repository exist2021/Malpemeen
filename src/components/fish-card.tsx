import Image from 'next/image';
import { Phone } from 'lucide-react';

import type { FishListing } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FishCardProps {
  listing: FishListing;
}

export function FishCard({ listing }: FishCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={listing.photoUrl}
          alt={listing.description}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          data-ai-hint="fish"
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{listing.sellerName || 'A Seller'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-foreground/80">{listing.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <a href={`tel:${listing.sellerPhone}`}>
            <Phone className="mr-2 h-4 w-4" />
            Call Seller
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
