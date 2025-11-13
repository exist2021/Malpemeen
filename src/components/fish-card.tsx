import Image from 'next/image';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react';

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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface FishCardProps {
  listing: FishListing;
}

export function FishCard({ listing }: FishCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <Carousel className="w-full">
        <CarouselContent>
          {listing.photoUrls.map((url, index) => (
            <CarouselItem key={index}>
              <div className="relative h-48 w-full">
                <Image
                  src={url}
                  alt={listing.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  data-ai-hint="fish"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {listing.photoUrls.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
            </>
        )}
      </Carousel>

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
